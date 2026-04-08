'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@/types';

interface SettingsStore {
  theme: Theme;
  quality: 'low' | 'medium' | 'high';
  hasCompletedOnboarding: boolean;
  favoriteGenres: string[];
  crossfadeDuration: number; // 0 = off, 1-10 seconds
  equalizerPreset: string; // 'flat' | 'bass' | 'vocal' | 'pop' | 'rock' | 'jazz'

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setQuality: (quality: 'low' | 'medium' | 'high') => void;
  completeOnboarding: (genres: string[]) => void;
  setCrossfadeDuration: (duration: number) => void;
  setEqualizerPreset: (preset: string) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      quality: 'medium',
      hasCompletedOnboarding: false,
      favoriteGenres: [],
      crossfadeDuration: 0,
      equalizerPreset: 'flat',

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark',
      })),
      setQuality: (quality) => set({ quality }),
      completeOnboarding: (genres) => set({
        hasCompletedOnboarding: true,
        favoriteGenres: genres,
      }),
      setCrossfadeDuration: (duration) => set({ crossfadeDuration: duration }),
      setEqualizerPreset: (preset) => set({ equalizerPreset: preset }),
      resetSettings: () => set({
        theme: 'dark',
        quality: 'medium',
        hasCompletedOnboarding: false,
        favoriteGenres: [],
        crossfadeDuration: 0,
        equalizerPreset: 'flat',
      }),
    }),
    {
      name: 'music-player-settings',
    }
  )
);
