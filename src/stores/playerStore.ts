'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track, RepeatMode } from '@/types';

interface PlayerStore {
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
  isRadioMode: boolean;

  setTrack: (track: Track) => void;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setFullPlayerOpen: (open: boolean) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  toggleRadioMode: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const usePlayerStore = create<PlayerStore>()(persist((set, get) => ({
  currentTrack: null,
  queue: [],
  originalQueue: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 100,
  repeatMode: 'off',
  isShuffled: false,
  isFullPlayerOpen: false,
  isRadioMode: false,

  setTrack: (track) => set({ currentTrack: track }),

  playTrack: (track, queue) => {
    const state = get();
    if (queue) {
      const trackIndex = queue.findIndex(t => t.id === track.id);
      const newQueue = trackIndex >= 0
        ? queue.slice(trackIndex + 1)
        : queue.filter(t => t.id !== track.id);
      set({
        currentTrack: track,
        queue: state.isShuffled ? shuffleArray(newQueue) : newQueue,
        originalQueue: newQueue,
        isPlaying: true,
        currentTime: 0,
      });
    } else {
      set({
        currentTrack: track,
        isPlaying: true,
        currentTime: 0,
      });
    }
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  nextTrack: () => {
    const { queue, currentTrack, repeatMode, isShuffled, originalQueue } = get();
    if (repeatMode === 'one') {
      set({ currentTime: 0, isPlaying: true });
      return;
    }
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      set({
        currentTrack: next,
        queue: rest,
        currentTime: 0,
        isPlaying: true,
      });
    } else if (repeatMode === 'all' && currentTrack) {
      const allTracks = isShuffled ? shuffleArray(originalQueue) : originalQueue;
      if (allTracks.length > 0) {
        const [next, ...rest] = allTracks;
        set({
          currentTrack: next,
          queue: rest,
          originalQueue: allTracks,
          currentTime: 0,
          isPlaying: true,
        });
      }
    } else {
      set({ isPlaying: false });
    }
  },

  prevTrack: () => {
    const { currentTime, currentTrack, queue } = get();
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }
    if (currentTrack && queue.length > 0) {
      set({ currentTime: 0 });
    }
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),

  toggleRepeat: () => set((state) => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(state.repeatMode);
    return { repeatMode: modes[(currentIndex + 1) % 3] };
  }),

  toggleShuffle: () => set((state) => {
    if (state.isShuffled) {
      return { isShuffled: false, queue: [...state.originalQueue] };
    }
    return {
      isShuffled: true,
      originalQueue: [...state.queue],
      queue: shuffleArray(state.queue),
    };
  }),

  setFullPlayerOpen: (open) => set({ isFullPlayerOpen: open }),

  addToQueue: (track) => set((state) => ({
    queue: [...state.queue, track],
    originalQueue: [...state.originalQueue, track],
  })),

  removeFromQueue: (index) => set((state) => {
    const newQueue = [...state.queue];
    newQueue.splice(index, 1);
    const newOriginal = [...state.originalQueue];
    newOriginal.splice(index, 1);
    return { queue: newQueue, originalQueue: newOriginal };
  }),

  reorderQueue: (from, to) => set((state) => {
    const newQueue = [...state.queue];
    const [item] = newQueue.splice(from, 1);
    newQueue.splice(to, 0, item);
    return { queue: newQueue };
  }),

  clearQueue: () => set({ queue: [], originalQueue: [] }),

  toggleRadioMode: () => set((state) => ({ isRadioMode: !state.isRadioMode })),

  playQueue: (tracks, startIndex = 0) => {
    const track = tracks[startIndex];
    const remaining = tracks.slice(startIndex + 1);
    set({
      currentTrack: track,
      queue: remaining,
      originalQueue: remaining,
      isPlaying: true,
      currentTime: 0,
    });
  },
}), {
  name: 'music-player-player',
  partialize: (state) => ({
    currentTrack: state.currentTrack,
    queue: state.queue,
    originalQueue: state.originalQueue,
    volume: state.volume,
    repeatMode: state.repeatMode,
    isShuffled: state.isShuffled,
  }),
}));
