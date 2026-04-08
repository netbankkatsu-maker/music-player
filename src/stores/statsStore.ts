'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayRecord {
  trackId: string;
  title: string;
  artist: string;
  thumbnail: string;
  timestamp: number; // unix ms
  duration: number; // seconds listened
}

interface ArtistStat {
  name: string;
  count: number;
  totalTime: number; // seconds
}

interface StatsStore {
  playRecords: PlayRecord[];
  totalListenTime: number; // seconds

  recordPlay: (track: { id: string; title: string; artist: string; thumbnail: string }, duration: number) => void;
  getTopArtists: (limit?: number) => ArtistStat[];
  getTopTracks: (limit?: number) => { id: string; title: string; artist: string; thumbnail: string; count: number }[];
  getListeningByHour: () => number[];
  getWeeklyTime: () => number;
  clearStats: () => void;
}

export const useStatsStore = create<StatsStore>()(persist((set, get) => ({
  playRecords: [],
  totalListenTime: 0,

  recordPlay: (track, duration) => {
    if (duration < 10) return; // Ignore very short plays
    set((state) => ({
      playRecords: [
        ...state.playRecords.slice(-500), // Keep last 500 records
        {
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          thumbnail: track.thumbnail,
          timestamp: Date.now(),
          duration,
        },
      ],
      totalListenTime: state.totalListenTime + duration,
    }));
  },

  getTopArtists: (limit = 10) => {
    const records = get().playRecords;
    const artistMap = new Map<string, ArtistStat>();
    for (const r of records) {
      const existing = artistMap.get(r.artist) || { name: r.artist, count: 0, totalTime: 0 };
      existing.count++;
      existing.totalTime += r.duration;
      artistMap.set(r.artist, existing);
    }
    return [...artistMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  getTopTracks: (limit = 10) => {
    const records = get().playRecords;
    const trackMap = new Map<string, { id: string; title: string; artist: string; thumbnail: string; count: number }>();
    for (const r of records) {
      const existing = trackMap.get(r.trackId) || {
        id: r.trackId, title: r.title, artist: r.artist, thumbnail: r.thumbnail, count: 0,
      };
      existing.count++;
      trackMap.set(r.trackId, existing);
    }
    return [...trackMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  getListeningByHour: () => {
    const records = get().playRecords;
    const hours = new Array(24).fill(0);
    for (const r of records) {
      const hour = new Date(r.timestamp).getHours();
      hours[hour] += r.duration;
    }
    return hours;
  },

  getWeeklyTime: () => {
    const records = get().playRecords;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return records
      .filter((r) => r.timestamp >= weekAgo)
      .reduce((sum, r) => sum + r.duration, 0);
  },

  clearStats: () => set({ playRecords: [], totalListenTime: 0 }),
}), {
  name: 'music-player-stats',
}));
