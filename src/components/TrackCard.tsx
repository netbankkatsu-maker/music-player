'use client';

import { useState } from 'react';
import { Play, Plus, Heart, ListPlus, MoreHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track } from '@/types';
import { usePlayerStore } from '@/stores/playerStore';
import { usePlaylistStore } from '@/stores/playlistStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatTime } from '@/lib/utils';

interface TrackCardProps {
  track: Track;
  index?: number;
  showDuration?: boolean;
  queue?: Track[];
  onAddToPlaylist?: (track: Track) => void;
}

export function TrackCard({ track, index, showDuration = true, queue, onAddToPlaylist }: TrackCardProps) {
  const { playTrack, addToQueue } = usePlayerStore();
  const { toggleFavorite, isFavorite } = usePlaylistStore();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [showMenu, setShowMenu] = useState(false);

  const textColor = isDark ? '#E5E5E5' : '#111827';
  const subText = isDark ? '#9CA3AF' : '#6B7280';
  const accent = isDark ? '#00D4AA' : '#059669';
  const cardBg = isDark ? '#16213E' : '#F3F4F6';
  const isFav = isFavorite(track.id);

  return (
    <div className="flex items-center gap-3 py-2 group relative">
      {/* Thumbnail */}
      <div
        className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative cursor-pointer"
        onClick={() => playTrack(track, queue)}
      >
        <img src={track.thumbnail} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play size={18} fill="white" color="white" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playTrack(track, queue)}>
        <p className="text-sm font-medium truncate" style={{ color: textColor }}>
          {track.title}
        </p>
        <p className="text-xs truncate" style={{ color: subText }}>
          {track.artist}
          {showDuration && track.duration > 0 && ` · ${formatTime(track.duration)}`}
        </p>
      </div>

      {/* Actions */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 flex-shrink-0 active:scale-90 transition-transform"
      >
        <MoreHorizontal size={18} color={subText} />
      </button>

      {/* Context Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 top-full z-40 rounded-2xl shadow-xl overflow-hidden min-w-[180px]"
              style={{ background: isDark ? '#1A1A2E' : '#FFFFFF', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}
            >
              <button
                onClick={() => { playTrack(track, queue); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm"
                style={{ color: textColor }}
              >
                <Play size={16} /> 再生
              </button>
              <button
                onClick={() => { addToQueue(track); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm"
                style={{ color: textColor }}
              >
                <Plus size={16} /> 次に再生
              </button>
              <button
                onClick={() => { toggleFavorite(track); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm"
                style={{ color: isFav ? '#ef4444' : textColor }}
              >
                <Heart size={16} fill={isFav ? '#ef4444' : 'none'} /> {isFav ? 'お気に入り解除' : 'お気に入り'}
              </button>
              {onAddToPlaylist && (
                <button
                  onClick={() => { onAddToPlaylist(track); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm"
                  style={{ color: textColor }}
                >
                  <ListPlus size={16} /> プレイリストに追加
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
