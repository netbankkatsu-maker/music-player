'use client';

import { use, useState, useCallback } from 'react';
import { ArrowLeft, Play, Shuffle, Trash2, Edit3, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TrackCard } from '@/components/TrackCard';
import { usePlaylistStore } from '@/stores/playlistStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatDuration } from '@/lib/utils';

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { playlists, deletePlaylist, renamePlaylist, removeTrackFromPlaylist } = usePlaylistStore();
  const { playQueue } = usePlayerStore();
  const { toggleShuffle } = usePlayerStore();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const playlist = playlists.find((p) => p.id === id);

  const textColor = isDark ? '#E5E5E5' : '#111827';
  const subText = isDark ? '#9CA3AF' : '#6B7280';
  const accent = isDark ? '#00D4AA' : '#059669';
  const surface = isDark ? '#1A1A2E' : '#FFFFFF';

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: subText }}>プレイリストが見つかりません</p>
      </div>
    );
  }

  const totalDuration = playlist.tracks.reduce((sum, t) => sum + t.duration, 0);
  const isSystemPlaylist = id === 'favorites' || id === 'history';
  const thumbs = playlist.tracks.slice(0, 4);

  const handlePlay = () => {
    if (playlist.tracks.length === 0) return;
    playQueue(playlist.tracks);
  };

  const handleShufflePlay = () => {
    if (playlist.tracks.length === 0) return;
    const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
    playQueue(shuffled);
  };

  const handleRename = () => {
    if (editName.trim()) {
      renamePlaylist(id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    deletePlaylist(id);
    router.push('/playlists');
  };

  return (
    <div className="pt-[env(safe-area-inset-top)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color={textColor} />
        </button>
        {!isSystemPlaylist && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2">
              <MoreVertical size={20} color={subText} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-0 top-full z-40 rounded-2xl shadow-xl overflow-hidden min-w-[160px]"
                    style={{ background: surface, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}
                  >
                    <button
                      onClick={() => { setEditName(playlist.name); setIsEditing(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm"
                      style={{ color: textColor }}
                    >
                      <Edit3 size={16} /> 名前を変更
                    </button>
                    <button
                      onClick={() => { handleDelete(); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={16} /> 削除
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Cover */}
      <div className="px-4 mb-4">
        <div className="w-48 h-48 rounded-3xl overflow-hidden mx-auto shadow-2xl">
          {thumbs.length >= 4 ? (
            <div className="grid grid-cols-2 w-full h-full">
              {thumbs.map((t, i) => (
                <img key={i} src={t.thumbnail} alt="" className="w-full h-full object-cover" />
              ))}
            </div>
          ) : thumbs.length > 0 ? (
            <img src={thumbs[0].thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: isDark ? '#1A1A2E' : '#E5E7EB' }}>
              <Play size={40} color={subText} />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="text-center px-4 mb-4">
        {isEditing ? (
          <div className="flex gap-2 max-w-xs mx-auto">
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="flex-1 px-4 py-2 rounded-xl text-sm outline-none text-center"
              style={{ background: isDark ? '#16213E' : '#F3F4F6', color: textColor }}
            />
            <button onClick={handleRename} className="text-sm font-medium" style={{ color: accent }}>
              保存
            </button>
          </div>
        ) : (
          <h1 className="text-xl font-bold" style={{ color: textColor }}>{playlist.name}</h1>
        )}
        <p className="text-xs mt-1" style={{ color: subText }}>
          {playlist.tracks.length}曲 · {formatDuration(totalDuration)}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3 px-4 mb-6">
        <button
          onClick={handleShufflePlay}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium active:scale-95 transition-transform"
          style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
            color: textColor,
          }}
        >
          <Shuffle size={16} /> シャッフル
        </button>
        <button
          onClick={handlePlay}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold active:scale-95 transition-transform"
          style={{ background: accent, color: '#0D0D0D' }}
        >
          <Play size={16} fill="#0D0D0D" /> 再生
        </button>
      </div>

      {/* Track list */}
      <div className="px-4">
        {playlist.tracks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: subText }}>曲がありません</p>
          </div>
        ) : (
          playlist.tracks.map((track, index) => (
            <div key={`${track.id}-${index}`} className="relative">
              <TrackCard track={track} queue={playlist.tracks} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
