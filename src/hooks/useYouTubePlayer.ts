'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/stores/playerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { usePlaylistStore } from '@/stores/playlistStore';

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          height: string;
          width: string;
          videoId?: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  loadVideoById: (videoId: string) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

const QUALITY_MAP = {
  low: 'small',
  medium: 'medium',
  high: 'hd720',
};

export function useYouTubePlayer() {
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isApiReady = useRef(false);
  const pendingVideoId = useRef<string | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    nextTrack,
  } = usePlayerStore();

  const quality = useSettingsStore((s) => s.quality);
  const addToRecentTracks = usePlaylistStore((s) => s.addToRecentTracks);

  const startTimeUpdate = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        if (time !== undefined) {
          usePlayerStore.getState().setCurrentTime(time);
        }
      }
    }, 500);
  }, []);

  const stopTimeUpdate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const initPlayer = useCallback(() => {
    if (playerRef.current) return;

    let container = document.getElementById('yt-player-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'yt-player-container';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.overflow = 'hidden';
      document.body.appendChild(container);
    }

    let playerDiv = document.getElementById('yt-player');
    if (!playerDiv) {
      playerDiv = document.createElement('div');
      playerDiv.id = 'yt-player';
      container.appendChild(playerDiv);
    }

    playerRef.current = new window.YT.Player('yt-player', {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onReady: (event) => {
          playerRef.current = event.target;
          event.target.setVolume(usePlayerStore.getState().volume);
          if (pendingVideoId.current) {
            event.target.loadVideoById(pendingVideoId.current);
            pendingVideoId.current = null;
          }
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            stopTimeUpdate();
            nextTrack();
          } else if (event.data === window.YT.PlayerState.PLAYING) {
            const dur = event.target.getDuration();
            if (dur) setDuration(dur);
            startTimeUpdate();
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            stopTimeUpdate();
          }
        },
        onError: (event) => {
          console.error('YouTube Player Error:', event.data);
          nextTrack();
        },
      },
    });
  }, [nextTrack, setDuration, startTimeUpdate, stopTimeUpdate]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.YT && window.YT.Player) {
      isApiReady.current = true;
      initPlayer();
      return;
    }

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existingScript) {
      window.onYouTubeIframeAPIReady = () => {
        isApiReady.current = true;
        initPlayer();
      };
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      isApiReady.current = true;
      initPlayer();
    };

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);

    return () => {
      stopTimeUpdate();
    };
  }, [initPlayer, stopTimeUpdate]);

  // Handle track changes
  useEffect(() => {
    if (!currentTrack) return;

    addToRecentTracks(currentTrack);

    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById(currentTrack.id);
    } else {
      pendingVideoId.current = currentTrack.id;
      if (isApiReady.current) {
        initPlayer();
      }
    }
  }, [currentTrack?.id]);

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch {}
  }, [isPlaying]);

  // Handle volume
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      playerRef.current.setVolume(volume);
    } catch {}
  }, [volume]);

  const seekTo = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
    }
  }, [setCurrentTime]);

  // Listen for seek events from FullPlayer
  useEffect(() => {
    const handleSeek = (e: Event) => {
      const time = (e as CustomEvent).detail;
      seekTo(time);
    };
    window.addEventListener('yt-seek', handleSeek);
    return () => window.removeEventListener('yt-seek', handleSeek);
  }, [seekTo]);

  return { seekTo, playerRef };
}
