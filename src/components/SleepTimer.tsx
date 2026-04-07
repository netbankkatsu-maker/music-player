'use client';

import { X, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSleepTimer } from '@/hooks/useSleepTimer';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatTime } from '@/lib/utils';
import { useState } from 'react';

const PRESET_MINUTES = [15, 30, 45, 60];

export function SleepTimerModal({ onClose }: { onClose: () => void }) {
  const { isActive, remainingSeconds, startTimer, cancelTimer } = useSleepTimer();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [customMinutes, setCustomMinutes] = useState('');

  const bg = isDark ? '#1A1A2E' : '#FFFFFF';
  const textColor = isDark ? '#E5E5E5' : '#111827';
  const subText = isDark ? '#9CA3AF' : '#6B7280';
  const accent = isDark ? '#00D4AA' : '#059669';
  const cardBg = isDark ? '#16213E' : '#F3F4F6';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-lg rounded-t-3xl p-6"
        style={{ background: bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Moon size={20} color={accent} />
            <h3 className="text-lg font-bold" style={{ color: textColor }}>スリープタイマー</h3>
          </div>
          <button onClick={onClose} className="p-2">
            <X size={20} color={subText} />
          </button>
        </div>

        {isActive ? (
          <div className="text-center py-4">
            <p className="text-3xl font-bold mb-2" style={{ color: accent }}>
              {formatTime(remainingSeconds)}
            </p>
            <p className="text-sm mb-6" style={{ color: subText }}>後に再生を停止します</p>
            <button
              onClick={() => { cancelTimer(); onClose(); }}
              className="px-6 py-3 rounded-2xl font-medium"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
            >
              タイマーをキャンセル
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {PRESET_MINUTES.map((min) => (
                <button
                  key={min}
                  onClick={() => { startTimer(min); onClose(); }}
                  className="py-4 rounded-2xl font-medium text-center active:scale-95 transition-transform"
                  style={{ background: cardBg, color: textColor }}
                >
                  {min}分
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                placeholder="カスタム（分）"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background: cardBg, color: textColor }}
              />
              <button
                onClick={() => {
                  const min = parseInt(customMinutes);
                  if (min > 0) { startTimer(min); onClose(); }
                }}
                className="px-6 py-3 rounded-2xl font-medium"
                style={{ background: accent, color: '#0D0D0D' }}
              >
                設定
              </button>
            </div>
          </>
        )}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </motion.div>
    </motion.div>
  );
}
