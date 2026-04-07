'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@/types';

interface SettingsStore {
  theme: Theme;
  quality: 'low' | 'medium' | 'high';
  hasCompletedOnboarding: boolean;
  favoriteGenres: string[];

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setQuality: (quality: 'low' | 'medium' | 'high') => void;
  completeOnboarding: (genres: string[]) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      quality: 'medium',
      hasCompletedOnboarding: false,
      favoriteGenres: [],

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark',
      })),
      setQuality: (quality) => set({ quality }),
      completeOnboarding: (genres) => set({
        hasCompletedOnboarding: true,
        favoriteGenres: genres,
      }),
      resetSettings: () => set({
        theme: 'dark',
        quality: 'medium',
        hasCompletedOnboarding: false,
        favoriteGenres: [],
      }),
    }),
    {
      name: 'music-player-settings',
    }
  )
);
