'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/stores/playerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { usePlaylistStore } from '@/stores/playlistStore';
import { useStatsStore } from '@/stores/statsStore';
import { getRelatedVideos } from '@/lib/youtube';

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

  const crossfadeTriggeredRef = useRef(false);

  const startTimeUpdate = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        if (time !== undefined) {
          usePlayerStore.getState().setCurrentTime(time);

          // Crossfade: fade out near end of track
          const { duration } = usePlayerStore.getState();
          const crossfadeDuration = useSettingsStore.getState().crossfadeDuration;
          if (crossfadeDuration > 0 && duration > 0) {
            const remaining = duration - time;
            if (remaining <= crossfadeDuration && remaining > 0) {
              // Gradually reduce volume
              const fadePercent = remaining / crossfadeDuration;
              const baseVolume = usePlayerStore.getState().volume;
              playerRef.current.setVolume(Math.round(baseVolume * fadePercent));

              // Trigger next track early (once)
              if (remaining <= 0.5 && !crossfadeTriggeredRef.current) {
                crossfadeTriggeredRef.current = true;
                const ps = usePlayerStore.getState();
                if (ps.currentTrack && ps.currentTime > 10) {
                  useStatsStore.getState().recordPlay(ps.currentTrack, ps.currentTime);
                }
                usePlayerStore.getState().nextTrack();
              }
            }
          }

          // Update Media Session position state for lock screen seek bar
          if ('mediaSession' in navigator && navigator.mediaSession.setPositionState) {
            const dur = usePlayerStore.getState().duration;
            if (dur > 0) {
              try {
                navigator.mediaSession.setPositionState({
                  duration: dur,
                  playbackRate: 1,
                  position: Math.min(time, dur),
                });
              } catch {}
            }
          }
        }
      }
    }, 300); // Slightly faster interval for smoother crossfade
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
            // Record stats
            const ps = usePlayerStore.getState();
            if (ps.currentTrack && ps.currentTime > 10) {
              useStatsStore.getState().recordPlay(ps.currentTrack, ps.currentTime);
            }
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

    // Reset crossfade state and restore volume
    crossfadeTriggeredRef.current = false;
    if (playerRef.current) {
      playerRef.current.setVolume(usePlayerStore.getState().volume);
    }

    // Update Media Session metadata for lock screen / notification controls
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        artwork: currentTrack.thumbnail
          ? [
              { src: currentTrack.thumbnail, sizes: '480x360', type: 'image/jpeg' },
            ]
          : [],
      });
    }

    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById(currentTrack.id);
    } else {
      pendingVideoId.current = currentTrack.id;
      if (isApiReady.current) {
        initPlayer();
      }
    }
  }, [currentTrack?.id]);

  // Radio mode: auto-fetch related songs when queue is low
  const radioFetchingRef = useRef(false);
  useEffect(() => {
    const state = usePlayerStore.getState();
    if (!state.isRadioMode || !state.currentTrack || radioFetchingRef.current) return;
    if (state.queue.length > 3) return; // Still have enough in queue

    radioFetchingRef.current = true;
    getRelatedVideos(state.currentTrack.id, 10)
      .then((related) => {
        const currentState = usePlayerStore.getState();
        // Filter out already played/queued tracks
        const existingIds = new Set([
          currentState.currentTrack?.id,
          ...currentState.queue.map((t) => t.id),
        ]);
        const newTracks = related.filter((t) => !existingIds.has(t.id));
        if (newTracks.length > 0) {
          usePlayerStore.setState((s) => ({
            queue: [...s.queue, ...newTracks],
            originalQueue: [...s.originalQueue, ...newTracks],
          }));
        }
      })
      .finally(() => {
        radioFetchingRef.current = false;
      });
  }, [currentTrack?.id]);

  // Register Media Session action handlers for background/lock screen controls
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const { togglePlay, nextTrack: next, prevTrack: prev } = usePlayerStore.getState();

    navigator.mediaSession.setActionHandler('play', () => {
      usePlayerStore.getState().setIsPlaying(true);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      usePlayerStore.getState().setIsPlaying(false);
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      usePlayerStore.getState().nextTrack();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      usePlayerStore.getState().prevTrack();
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null && playerRef.current) {
        playerRef.current.seekTo(details.seekTime, true);
        usePlayerStore.getState().setCurrentTime(details.seekTime);
      }
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
  }, []);

  // Update Media Session playback state
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

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
