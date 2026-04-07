'use client';

import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';

export function YouTubePlayerHost() {
  useYouTubePlayer();
  return null;
}
