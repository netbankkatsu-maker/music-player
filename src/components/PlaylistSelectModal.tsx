'use client';

import { X, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Track } from '@/types';
import { usePlaylistStore } from '@/stores/playlistStore';
import { useSettingsStore } from '@/stores/settingsStore';

interface Props {
  track: Track;
  onClose: () => void;
}

export function PlaylistSelectModal({ track, onClose }: Props) {
  const { playlists, addTrackToPlaylist, createPlaylist } = usePlaylistStore();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [addedTo, setAddedTo] = useState<string | null>(null);

  const bg = isDark ? '#1A1A2E' : '#FFFFFF';
  const textColor = isDark ? '#E5E5E5' : '#111827';
  const subText = isDark ? '#9CA3AF' : '#6B7280';
  const accent = isDark ? '#00D4AA' : '#059669';
  const cardBg = isDark ? '#16213E' : '#F3F4F6';

  const userPlaylists = playlists.filter((p) => p.id !== 'history');

  const handleAdd = (playlistId: string) => {
    addTrackToPlaylist(playlistId, track);
    setAddedTo(playlistId);
    setTimeout(onClose, 600);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const pl = createPlaylist(newName.trim());
    addTrackToPlaylist(pl.id, track);
    setAddedTo(pl.id);
    setTimeout(onClose, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-lg max-h-[70vh] rounded-t-3xl flex flex-col"
        style={{ background: bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
          <h3 className="text-base font-bold" style={{ color: textColor }}>プレイリストに追加</h3>
          <button onClick={onClose} className="p-1">
            <X size={20} color={subText} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Create new */}
          {showCreate ? (
            <div className="flex gap-2 mb-4">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="プレイリスト名"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: cardBg, color: textColor }}
              />
              <button
                onClick={handleCreate}
                className="px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: accent, color: '#0D0D0D' }}
              >
                作成
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-3 w-full py-3 mb-2"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: accent }}
              >
                <Plus size={18} color="#0D0D0D" />
              </div>
              <span className="text-sm font-medium" style={{ color: accent }}>
                新しいプレイリストを作成
              </span>
            </button>
          )}

          {/* Existing playlists */}
          {userPlaylists.map((pl) => {
            const isAdded = addedTo === pl.id;
            const alreadyHas = pl.tracks.some((t) => t.id === track.id);
            return (
              <button
                key={pl.id}
                onClick={() => !alreadyHas && handleAdd(pl.id)}
                className="flex items-center gap-3 w-full py-3"
                disabled={alreadyHas}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ background: cardBg }}>
                  {pl.tracks[0] ? (
                    <img src={pl.tracks[0].thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: textColor }}>{pl.name}</p>
                  <p className="text-xs" style={{ color: subText }}>{pl.tracks.length}曲</p>
                </div>
                {(isAdded || alreadyHas) && (
                  <Check size={18} color={accent} />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
