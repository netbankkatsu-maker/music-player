'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaylistCard } from '@/components/PlaylistCard';
import { usePlaylistStore } from '@/stores/playlistStore';
import { useSettingsStore } from '@/stores/settingsStore';

export default function PlaylistsPage() {
  const { playlists, createPlaylist } = usePlaylistStore();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const textColor = isDark ? '#E5E5E5' : '#111827';
  const subText = isDark ? '#9CA3AF' : '#6B7280';
  const accent = isDark ? '#00D4AA' : '#059669';
  const cardBg = isDark ? '#16213E' : '#F3F4F6';

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPlaylist(newName.trim());
    setNewName('');
    setShowCreate(false);
  };

  return (
    <div className="pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold" style={{ color: textColor }}>プレイリスト</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: accent }}
        >
          {showCreate ? <X size={20} color="#0D0D0D" /> : <Plus size={20} color="#0D0D0D" />}
        </button>
      </div>

      {/* Create playlist form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-4"
          >
            <div className="flex gap-2 mb-4">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="プレイリスト名を入力"
                className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background: cardBg, color: textColor }}
              />
              <button
                onClick={handleCreate}
                className="px-5 py-3 rounded-2xl text-sm font-medium"
                style={{ background: accent, color: '#0D0D0D' }}
              >
                作成
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist grid */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </div>
  );
}
