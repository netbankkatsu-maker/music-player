'use client';

import { useState } from 'react';
import { Music, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@/stores/settingsStore';
import { GENRES } from '@/lib/trending';

export function Onboarding() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  const toggleGenre = (value: string) => {
    setSelectedGenres((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    );
  };

  return (
    <div
      className="h-dvh flex flex-col items-center justify-center px-8"
      style={{ background: '#0D0D0D' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
          style={{ background: 'linear-gradient(135deg, #00D4AA, #7C3AED)' }}
        >
          <Music size={40} color="white" />
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: '#E5E5E5' }}>
          Music Player
        </h1>
        <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>
          好きなジャンルを選んで、あなただけの音楽体験を始めましょう
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {GENRES.map(({ label, value }) => {
            const isSelected = selectedGenres.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleGenre(value)}
                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, #00D4AA, #7C3AED)'
                    : '#1A1A2E',
                  color: isSelected ? '#FFFFFF' : '#9CA3AF',
                  border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => completeOnboarding(selectedGenres)}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{
            background: 'linear-gradient(135deg, #00D4AA, #059669)',
            color: '#0D0D0D',
          }}
        >
          はじめる
          <ChevronRight size={20} />
        </button>

        <button
          onClick={() => completeOnboarding([])}
          className="mt-4 text-sm py-2"
          style={{ color: '#9CA3AF' }}
        >
          スキップ
        </button>
      </motion.div>
    </div>
  );
}
