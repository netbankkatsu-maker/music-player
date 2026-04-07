'use client';

import { Play, Pause, SkipForward } from 'lucide-react';
import { usePlayerStore } from '@/stores/playerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { motion } from 'framer-motion';

export function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, setFullPlayerOpen, currentTime, duration } =
    usePlayerStore();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      className="fixed left-0 right-0 z-50"
      style={{ bottom: '64px' }}
    >
      {/* Progress bar */}
      <div
        className="h-[2px] w-full"
        style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: isDark ? '#00D4AA' : '#059669',
          }}
        />
      </div>

      <div
        className="flex items-center gap-3 px-4 py-2 cursor-pointer"
        style={{
          background: isDark ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        onClick={() => setFullPlayerOpen(true)}
      >
        {/* Thumbnail */}
        <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 relative">
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex gap-[2px]">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{ background: isDark ? '#00D4AA' : '#059669' }}
                    animate={{
                      height: [8, 16, 8],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Title - marquee */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="text-sm font-medium truncate" style={{ color: isDark ? '#E5E5E5' : '#111827' }}>
            {currentTrack.title}
          </div>
          <div className="text-xs truncate" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
            {currentTrack.artist}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="p-2 rounded-full active:scale-90 transition-transform"
          >
            {isPlaying ? (
              <Pause size={22} fill={isDark ? '#E5E5E5' : '#111827'} color={isDark ? '#E5E5E5' : '#111827'} />
            ) : (
              <Play size={22} fill={isDark ? '#E5E5E5' : '#111827'} color={isDark ? '#E5E5E5' : '#111827'} />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextTrack();
            }}
            className="p-2 rounded-full active:scale-90 transition-transform"
          >
            <SkipForward size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
