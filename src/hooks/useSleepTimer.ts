'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/stores/playerStore';

export function useSleepTimer() {
  const [isActive, setIsActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const originalVolume = useRef(100);

  const startTimer = useCallback((minutes: number) => {
    const seconds = minutes * 60;
    originalVolume.current = usePlayerStore.getState().volume;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsActive(true);
  }, []);

  const cancelTimer = useCallback(() => {
    setIsActive(false);
    setRemainingSeconds(0);
    setTotalSeconds(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setIsActive(false);
          setVolume(originalVolume.current);
          return 0;
        }
        // Fade out in the last 30 seconds
        if (prev <= 30) {
          const fadeVolume = Math.round(originalVolume.current * (prev / 30));
          setVolume(fadeVolume);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, setIsPlaying, setVolume]);

  return {
    isActive,
    remainingSeconds,
    totalSeconds,
    startTimer,
    cancelTimer,
  };
}
