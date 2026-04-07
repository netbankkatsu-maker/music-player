export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  originalQueue: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isFullPlayerOpen: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  publishedAt?: string;
}

export type Theme = 'dark' | 'light';

export interface SettingsState {
  theme: Theme;
  quality: 'low' | 'medium' | 'high';
  hasCompletedOnboarding: boolean;
  favoriteGenres: string[];
}

export interface SleepTimerState {
  isActive: boolean;
  remainingSeconds: number;
  totalSeconds: number;
}
