'use client';

import { useState, useCallback } from 'react';
import { Play, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AGE_GROUPS, GENRES, buildTrendQuery } from '@/lib/trending';
import { searchYouTube } from '@/lib/youtube';
import { usePlayerStore } from '@/stores/playerStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function TrendPlayer() {
  const [selectedAge, setSelectedAge] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>();
  const [showGenres, setShowGenres] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { playQueue } = usePlayerStore();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';

  const accent = isDark ? '#00D4AA' : '#059669';
  const subText = isDark ? '#9CA3AF' : '#6B7280';
  const surface = isDark ? '#1A1A2E' : '#FFFFFF';

  const handlePlay = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = buildTrendQuery(selectedAge, selectedGenre);
      const results = await searchYouTube(query, 20);
      if (results.length > 0) {
        playQueue(results);
      }
    } catch (err) {
      console.error('Trend search failed:', err);
    }
    setIsLoading(false);
  }, [selectedAge, selectedGenre, playQueue]);

  return (
    <div className="px-4 mb-6">
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${isDark ? '#1A1A2E' : '#EEF2FF'}, ${isDark ? '#16213E' : '#F0FDF4'})`,
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
          style={{ background: accent }}
        />
        <div
          className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full opacity-10"
          style={{ background: isDark ? '#7C3AED' : '#6D28D9' }}
        />

        <div className="relative z-10">
          <h2 className="text-lg font-bold mb-1" style={{ color: isDark ? '#E5E5E5' : '#111827' }}>
            トレンドMIX
          </h2>
          <p className="text-xs mb-4" style={{ color: subText }}>
            年代やジャンルに合わせた人気曲を自動再生
          </p>

          {/* Age chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1 scrollbar-hide">
            {AGE_GROUPS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setSelectedAge(value)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
                style={{
                  background: selectedAge === value ? accent : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                  color: selectedAge === value ? '#0D0D0D' : subText,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Genre toggle */}
          <button
            onClick={() => setShowGenres(!showGenres)}
            className="flex items-center gap-1 text-xs mb-2"
            style={{ color: subText }}
          >
            ジャンルを選択
            {showGenres ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <AnimatePresence>
            {showGenres && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  {GENRES.map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => setSelectedGenre(selectedGenre === value ? undefined : value)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
                      style={{
                        background: selectedGenre === value
                          ? (isDark ? '#7C3AED' : '#6D28D9')
                          : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                        color: selectedGenre === value ? '#FFFFFF' : subText,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Play button */}
          <button
            onClick={handlePlay}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${isDark ? '#7C3AED' : '#6D28D9'})`,
              color: '#FFFFFF',
            }}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Play size={18} fill="white" />
            )}
            トレンドMIXを再生
          </button>
        </div>
      </div>
    </div>
  );
}
