'use client';

import { Heart, Music, Clock } from 'lucide-react';
import Link from 'next/link';
import { Playlist } from '@/types';
import { useSettingsStore } from '@/stores/settingsStore';

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';
  const cardBg = isDark ? '#16213E' : '#F3F4F6';
  const textColor = isDark ? '#E5E5E5' : '#111827';
  const subText = isDark ? '#9CA3AF' : '#6B7280';

  const isFavorites = playlist.id === 'favorites';
  const isHistory = playlist.id === 'history';
  const thumbs = playlist.tracks.slice(0, 4);

  return (
    <Link href={`/playlists/${playlist.id}`}>
      <div
        className="rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
        style={{ background: cardBg }}
      >
        {/* Cover grid */}
        <div className="aspect-square relative">
          {thumbs.length >= 4 ? (
            <div className="grid grid-cols-2 w-full h-full">
              {thumbs.map((t, i) => (
                <img key={i} src={t.thumbnail} alt="" className="w-full h-full object-cover" />
              ))}
            </div>
          ) : thumbs.length > 0 ? (
            <img src={thumbs[0].thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: isDark ? '#1A1A2E' : '#E5E7EB' }}
            >
              {isFavorites ? (
                <Heart size={32} color={isDark ? '#00D4AA' : '#059669'} />
              ) : isHistory ? (
                <Clock size={32} color={isDark ? '#00D4AA' : '#059669'} />
              ) : (
                <Music size={32} color={subText} />
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-center gap-1.5">
            {isFavorites && <Heart size={12} color="#ef4444" fill="#ef4444" />}
            <p className="text-sm font-medium truncate" style={{ color: textColor }}>
              {playlist.name}
            </p>
          </div>
          <p className="text-xs mt-0.5" style={{ color: subText }}>
            {playlist.tracks.length}曲
          </p>
        </div>
      </div>
    </Link>
  );
}
