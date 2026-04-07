'use client';

import { X, GripVertical, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/stores/playerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatTime } from '@/lib/utils';

export function QueueView({ onClose }: { onClose: () => void }) {
  const { queue, currentTrack, removeFromQueue, playTrack } = usePlayerStore();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';
  const bg = isDark ? '#0D0D0D' : '#F9FAFB';
  const surface = isDark ? '#1A1A2E' : '#FFFFFF';
  const textColor = isDark ? '#E5E5E5' : '#111827';
  const subText = isDark ? '#9CA3AF' : '#6B7280';
  const accent = isDark ? '#00D4AA' : '#059669';

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute inset-0 z-10 flex flex-col"
      style={{ background: bg }}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-lg font-bold" style={{ color: textColor }}>再生キュー</h2>
        <button onClick={onClose} className="p-2">
          <X size={24} color={textColor} />
        </button>
      </div>

      {currentTrack && (
        <div className="px-4 mb-4">
          <p className="text-xs font-medium mb-2" style={{ color: accent }}>再生中</p>
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: surface }}>
            <img
              src={currentTrack.thumbnail}
              alt=""
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: textColor }}>{currentTrack.title}</p>
              <p className="text-xs truncate" style={{ color: subText }}>{currentTrack.artist}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 mb-2">
        <p className="text-xs font-medium" style={{ color: subText }}>
          次に再生 ({queue.length}曲)
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {queue.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm" style={{ color: subText }}>キューは空です</p>
          </div>
        ) : (
          queue.map((track, index) => (
            <div
              key={`${track.id}-${index}`}
              className="flex items-center gap-3 py-2 group"
            >
              <GripVertical size={16} color={subText} className="flex-shrink-0 opacity-50" />
              <div
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                onClick={() => playTrack(track)}
              >
                <img src={track.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: textColor }}>{track.title}</p>
                  <p className="text-xs truncate" style={{ color: subText }}>
                    {track.artist} · {formatTime(track.duration)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFromQueue(index)}
                className="p-2 opacity-50 hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} color={subText} />
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
