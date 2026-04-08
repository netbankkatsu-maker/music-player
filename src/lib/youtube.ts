import { SearchResult } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

function parseDuration(iso8601: string): number {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}

export interface SearchOptions {
  maxResults?: number;
  publishedAfter?: string;
}

export async function searchYouTube(query: string, optionsOrMax?: number | SearchOptions): Promise<SearchResult[]> {
  if (!API_KEY) {
    console.warn('YouTube API key not configured');
    return [];
  }

  const options: SearchOptions = typeof optionsOrMax === 'number'
    ? { maxResults: optionsOrMax }
    : optionsOrMax || {};

  const searchParams = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    videoCategoryId: '10',
    maxResults: (options.maxResults || 20).toString(),
    key: API_KEY,
  });

  if (options.publishedAfter) {
    searchParams.set('publishedAfter', options.publishedAfter);
  }

  const searchRes = await fetch(`${BASE_URL}/search?${searchParams}`);
  if (!searchRes.ok) {
    console.error('YouTube search failed:', searchRes.status);
    return [];
  }
  const searchData = await searchRes.json();

  const videoIds = searchData.items
    ?.map((item: { id?: { videoId?: string } }) => item.id?.videoId)
    .filter(Boolean)
    .join(',');

  if (!videoIds) return [];

  const detailParams = new URLSearchParams({
    part: 'contentDetails,snippet',
    id: videoIds,
    key: API_KEY,
  });

  const detailRes = await fetch(`${BASE_URL}/videos?${detailParams}`);
  if (!detailRes.ok) return [];
  const detailData = await detailRes.json();

  return (detailData.items || [])
    .map((item: {
      id: string;
      snippet: { title: string; channelTitle: string; thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } } };
      contentDetails: { duration: string };
    }) => ({
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url ||
        '',
      duration: parseDuration(item.contentDetails.duration),
    }))
    .filter((track: { duration: number; title: string }) =>
      // Exclude Shorts and very short clips (under 60s)
      track.duration >= 60 &&
      // Exclude videos with #Shorts in title
      !/#shorts/i.test(track.title)
    );
}

export async function getRelatedVideos(videoId: string, maxResults = 15): Promise<SearchResult[]> {
  if (!API_KEY) return [];

  // Use search with relatedToVideoId
  const searchParams = new URLSearchParams({
    part: 'snippet',
    relatedToVideoId: videoId,
    type: 'video',
    videoCategoryId: '10',
    maxResults: maxResults.toString(),
    key: API_KEY,
  });

  const searchRes = await fetch(`${BASE_URL}/search?${searchParams}`);
  if (!searchRes.ok) return [];
  const searchData = await searchRes.json();

  const videoIds = searchData.items
    ?.map((item: { id?: { videoId?: string } }) => item.id?.videoId)
    .filter(Boolean)
    .join(',');

  if (!videoIds) return [];

  const detailParams = new URLSearchParams({
    part: 'contentDetails,snippet',
    id: videoIds,
    key: API_KEY,
  });

  const detailRes = await fetch(`${BASE_URL}/videos?${detailParams}`);
  if (!detailRes.ok) return [];
  const detailData = await detailRes.json();

  return (detailData.items || [])
    .map((item: {
      id: string;
      snippet: { title: string; channelTitle: string; thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } } };
      contentDetails: { duration: string };
    }) => ({
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url ||
        '',
      duration: parseDuration(item.contentDetails.duration),
    }))
    .filter((track: { duration: number; title: string }) =>
      track.duration >= 60 && !/#shorts/i.test(track.title)
    );
}
