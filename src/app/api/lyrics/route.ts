import { NextRequest, NextResponse } from 'next/server';

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

async function searchJLyric(title: string, artist: string): Promise<string | null> {
  try {
    // Search on j-lyric.net
    const searchParams = new URLSearchParams({
      kt: title,
      ka: artist,
      ct: '2',
    });
    const searchUrl = `https://j-lyric.net/index.php?${searchParams}`;
    const res = await fetch(searchUrl, { headers: HEADERS });
    if (!res.ok) return null;
    const html = await res.text();

    // Extract first result URL: <a href='/artist/XXXX/YYYY.html'>
    const linkMatch = html.match(/<div class='title'><a href='(\/artist\/[^']+)'>/);
    if (!linkMatch) return null;

    // Fetch lyrics page
    const lyricRes = await fetch(`https://j-lyric.net${linkMatch[1]}`, { headers: HEADERS });
    if (!lyricRes.ok) return null;
    const lyricHtml = await lyricRes.text();

    // Extract lyrics from <p id="Lyric">
    const lyricMatch = lyricHtml.match(/<p\s+id="Lyric"[^>]*>([\s\S]*?)<\/p>/i);
    if (!lyricMatch) return null;

    return decodeHtmlEntities(lyricMatch[1]) || null;
  } catch {
    return null;
  }
}

async function searchUtaNet(title: string, artist: string): Promise<string | null> {
  try {
    const keyword = `${title} ${artist}`.trim();
    const searchParams = new URLSearchParams({
      Keyword: keyword,
      Sort: '4',
    });
    const searchUrl = `https://www.uta-net.com/search/?${searchParams}`;
    const res = await fetch(searchUrl, { headers: HEADERS });
    if (!res.ok) return null;
    const html = await res.text();

    // Extract first song link
    const linkMatch = html.match(/href="\/song\/(\d+)\/"/);
    if (!linkMatch) return null;

    // Fetch lyrics page
    const lyricRes = await fetch(`https://www.uta-net.com/song/${linkMatch[1]}/`, { headers: HEADERS });
    if (!lyricRes.ok) return null;
    const lyricHtml = await lyricRes.text();

    // Extract lyrics from div id="kashi_area"
    const lyricMatch = lyricHtml.match(/<div\s+id="kashi_area"[^>]*>([\s\S]*?)<\/div>/i);
    if (!lyricMatch) return null;

    return decodeHtmlEntities(lyricMatch[1]) || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  const artist = searchParams.get('artist') || '';

  if (!title) {
    return NextResponse.json({ lyrics: null });
  }

  // Try j-lyric.net first (better for Japanese lyrics)
  const jLyric = await searchJLyric(title, artist);
  if (jLyric) {
    return NextResponse.json({ lyrics: jLyric, source: 'j-lyric.net' });
  }

  // Try uta-net.com as fallback
  const utaNet = await searchUtaNet(title, artist);
  if (utaNet) {
    return NextResponse.json({ lyrics: utaNet, source: 'uta-net.com' });
  }

  return NextResponse.json({ lyrics: null });
}
