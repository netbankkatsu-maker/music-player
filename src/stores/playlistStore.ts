'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Playlist, Track } from '@/types';

interface PlaylistStore {
  playlists: Playlist[];
  recentTracks: Track[];
  searchHistory: string[];

  createPlaylist: (name: string) => Playlist;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackIndex: number) => void;
  reorderPlaylistTracks: (playlistId: string, from: number, to: number) => void;
  toggleFavorite: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  addToRecentTracks: (track: Track) => void;
  removeFromRecentTracks: (trackId: string) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  clearRecentTracks: () => void;
  clearAllData: () => void;
}

const FAVORITES_ID = 'favorites';
const HISTORY_ID = 'history';

const createDefaultPlaylists = (): Playlist[] => [
  {
    id: FAVORITES_ID,
    name: 'お気に入り',
    tracks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: HISTORY_ID,
    name: '再生履歴',
    tracks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const usePlaylistStore = create<PlaylistStore>()(
  persist(
    (set, get) => ({
      playlists: createDefaultPlaylists(),
      recentTracks: [],
      searchHistory: [],

      createPlaylist: (name) => {
        const newPlaylist: Playlist = {
          id: `pl_${Date.now()}`,
          name,
          tracks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          playlists: [...state.playlists, newPlaylist],
        }));
        return newPlaylist;
      },

      deletePlaylist: (id) => {
        if (id === FAVORITES_ID || id === HISTORY_ID) return;
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id),
        }));
      },

      renamePlaylist: (id, name) => {
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      addTrackToPlaylist: (playlistId, track) => {
        set((state) => ({
          playlists: state.playlists.map((p) => {
            if (p.id !== playlistId) return p;
            if (p.tracks.some((t) => t.id === track.id)) return p;
            return {
              ...p,
              tracks: [...p.tracks, track],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeTrackFromPlaylist: (playlistId, trackIndex) => {
        set((state) => ({
          playlists: state.playlists.map((p) => {
            if (p.id !== playlistId) return p;
            const newTracks = [...p.tracks];
            newTracks.splice(trackIndex, 1);
            return { ...p, tracks: newTracks, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      reorderPlaylistTracks: (playlistId, from, to) => {
        set((state) => ({
          playlists: state.playlists.map((p) => {
            if (p.id !== playlistId) return p;
            const newTracks = [...p.tracks];
            const [item] = newTracks.splice(from, 1);
            newTracks.splice(to, 0, item);
            return { ...p, tracks: newTracks, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      toggleFavorite: (track) => {
        const state = get();
        const favorites = state.playlists.find((p) => p.id === FAVORITES_ID);
        if (!favorites) return;
        const isFav = favorites.tracks.some((t) => t.id === track.id);
        if (isFav) {
          set((state) => ({
            playlists: state.playlists.map((p) =>
              p.id === FAVORITES_ID
                ? { ...p, tracks: p.tracks.filter((t) => t.id !== track.id), updatedAt: new Date().toISOString() }
                : p
            ),
          }));
        } else {
          set((state) => ({
            playlists: state.playlists.map((p) =>
              p.id === FAVORITES_ID
                ? { ...p, tracks: [...p.tracks, track], updatedAt: new Date().toISOString() }
                : p
            ),
          }));
        }
      },

      isFavorite: (trackId) => {
        const favorites = get().playlists.find((p) => p.id === FAVORITES_ID);
        return favorites?.tracks.some((t) => t.id === trackId) ?? false;
      },

      addToRecentTracks: (track) => {
        set((state) => {
          const filtered = state.recentTracks.filter((t) => t.id !== track.id);
          const recent = [track, ...filtered].slice(0, 50);
          const playlists = state.playlists.map((p) => {
            if (p.id !== HISTORY_ID) return p;
            const histFiltered = p.tracks.filter((t) => t.id !== track.id);
            return { ...p, tracks: [track, ...histFiltered].slice(0, 100), updatedAt: new Date().toISOString() };
          });
          return { recentTracks: recent, playlists };
        });
      },

      removeFromRecentTracks: (trackId) => {
        set((state) => ({
          recentTracks: state.recentTracks.filter((t) => t.id !== trackId),
          playlists: state.playlists.map((p) =>
            p.id === HISTORY_ID
              ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId), updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      addToSearchHistory: (query) => {
        set((state) => {
          const filtered = state.searchHistory.filter((q) => q !== query);
          return { searchHistory: [query, ...filtered].slice(0, 20) };
        });
      },

      clearSearchHistory: () => set({ searchHistory: [] }),

      clearRecentTracks: () => set((state) => ({
        recentTracks: [],
        playlists: state.playlists.map((p) =>
          p.id === HISTORY_ID ? { ...p, tracks: [], updatedAt: new Date().toISOString() } : p
        ),
      })),

      clearAllData: () => set({
        playlists: createDefaultPlaylists(),
        recentTracks: [],
        searchHistory: [],
      }),
    }),
    {
      name: 'music-player-playlists',
    }
  )
);
