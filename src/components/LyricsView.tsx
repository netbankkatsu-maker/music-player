'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { fetchLyrics, LyricsResult, SyncedLine } from '@/lib/lyrics';
import { usePlayerStore } from '@/stores/playerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Loader2, MicVocal } from 'lucide-react';

export function LyricsView() {
  const { currentTrack, currentTime } = usePlayerStore();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);

  const accent = isDark ? '#00D4AA' : '#059669';
  const textColor = isDark ? '#E5E5E5' : '#111827';
  const subText = isDark ? '#9CA3AF' : '#6B7280';
  const dimText = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';

  useEffect(() => {
    if (!currentTrack) return;
    setLyrics(null);
    setError(false);
    setIsLoading(true);

    fetchLyrics(currentTrack.title, currentTrack.artist)
      .then((result) => {
        if (result.plain || result.synced) {
          setLyrics(result);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [currentTrack?.id]);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTime, lyrics]);

  const getActiveLine = (synced: SyncedLine[]): number => {
    for (let i = synced.length - 1; i >= 0; i--) {
      if (currentTime >= synced[i].time) return i;
    }
    return -1;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 size={24} color={accent} className="animate-spin mb-3" />
        <p className="text-xs" style={{ color: subText }}>歌詞を検索中...</p>
      </div>
    );
  }

  if (error || !lyrics) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <MicVocal size={32} color={subText} className="opacity-30 mb-3" />
        <p className="text-sm" style={{ color: subText }}>歌詞が見つかりませんでした</p>
      </div>
    );
  }

  // Synced lyrics (time-stamped)
  if (lyrics.synced && lyrics.synced.length > 0) {
    const activeIndex = getActiveLine(lyrics.synced);
    return (
      <div ref={containerRef} className="py-4 space-y-3">
        {lyrics.synced.map((line, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;
          return (
            <p
              key={i}
              ref={isActive ? activeLineRef : undefined}
              className="text-center transition-all duration-300 px-4"
              style={{
                fontSize: isActive ? '18px' : '15px',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? accent : isPast ? subText : dimText,
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {line.text}
            </p>
          );
        })}
      </div>
    );
  }

  // Plain lyrics (no timestamps)
  return (
    <div className="py-4 px-4">
      {lyrics.plain?.split('\n').map((line, i) => (
        <p
          key={i}
          className="text-center text-sm leading-7"
          style={{ color: line.trim() ? textColor : 'transparent' }}
        >
          {line || ' '}
        </p>
      ))}
    </div>
  );
}
