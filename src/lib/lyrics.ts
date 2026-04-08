export interface LyricsResult {
  plain: string | null;
  synced: SyncedLine[] | null;
}

export interface SyncedLine {
  time: number; // seconds
  text: string;
}

function parseLRC(lrc: string): SyncedLine[] {
  const lines: SyncedLine[] = [];
  for (const line of lrc.split('\n')) {
    const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/);
    if (match) {
      const mins = parseInt(match[1]);
      const secs = parseInt(match[2]);
      const ms = parseInt(match[3]);
      const time = mins * 60 + secs + ms / (match[3].length === 3 ? 1000 : 100);
      const text = match[4].trim();
      if (text) {
        lines.push({ time, text });
      }
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

function cleanTitle(title: string): string {
  let cleaned = title
    // Remove content after "from", "feat", "@" etc.
    .replace(/\s*(from|feat\.?|ft\.?|@|＠).*/gi, '')
    // Remove bracketed content
    .replace(/\s*[\[【（(].*?[\]】）)]\s*/g, ' ')
    // Remove common video suffixes
    .replace(/\s*(MV|PV|Official|Music\s*Video|Full|Ver\.|ver\.|Version|Lyric[s]?|Audio|HD|4K|公式|LIVE|Live|Short|Shorts|歌ってみた|弾いてみた|cover|Cover|COVER|踊ってみた)/gi, '')
    // Remove slashes and pipes
    .replace(/\s*[/／|｜]\s*/g, ' ')
    // Remove Japanese brackets
    .replace(/[『』「」]/g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
  // If title has artist prefix like "YOASOBI アイドル", try to extract just the song name
  // by removing the artist name if it appears at the start
  return cleaned;
}

function cleanArtist(artist: string): string {
  return artist
    .replace(/\s*(Official|YouTube|Channel|VEVO|公式|Topic)/gi, '')
    .replace(/\s*[/／]\s*/g, ' ')
    .trim();
}

async function trySearch(query: string): Promise<LyricsResult | null> {
  try {
    const params = new URLSearchParams({ q: query });
    const res = await fetch(`https://lrclib.net/api/search?${params}`);
    if (res.ok) {
      const results = await res.json();
      // Prefer results with synced lyrics
      const withSync = results.find((r: { syncedLyrics?: string }) => r.syncedLyrics);
      const best = withSync || results[0];
      if (best && (best.plainLyrics || best.syncedLyrics)) {
        return {
          plain: best.plainLyrics || null,
          synced: best.syncedLyrics ? parseLRC(best.syncedLyrics) : null,
        };
      }
    }
  } catch {}
  return null;
}

export async function fetchLyrics(title: string, artist: string): Promise<LyricsResult> {
  const cleanedTitle = cleanTitle(title);
  const cleanedArtist = cleanArtist(artist);

  // Try exact match first
  try {
    const params = new URLSearchParams({
      artist_name: cleanedArtist,
      track_name: cleanedTitle,
    });
    const res = await fetch(`https://lrclib.net/api/get?${params}`);
    if (res.ok) {
      const data = await res.json();
      if (data.plainLyrics || data.syncedLyrics) {
        return {
          plain: data.plainLyrics || null,
          synced: data.syncedLyrics ? parseLRC(data.syncedLyrics) : null,
        };
      }
    }
  } catch {}

  // Search with artist + title
  const result1 = await trySearch(`${cleanedArtist} ${cleanedTitle}`);
  if (result1) return result1;

  // Search with just title (for cases where artist name is different)
  const result2 = await trySearch(cleanedTitle);
  if (result2) return result2;

  // Try extracting song name from title that contains artist
  // e.g. "YOASOBI アイドル" -> search "アイドル YOASOBI"
  const parts = cleanedTitle.split(/\s+/);
  if (parts.length >= 2) {
    const result3 = await trySearch(parts.slice(1).join(' ') + ' ' + parts[0]);
    if (result3) return result3;
  }

  return { plain: null, synced: null };
}
