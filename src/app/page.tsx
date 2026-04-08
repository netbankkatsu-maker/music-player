'use client';

import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { TrendPlayer } from '@/components/TrendPlayer';
import { usePlaylistStore } from '@/stores/playlistStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useSettingsStore } from '@/stores/settingsStore';

export default function HomePage() {
  const recentTracks = usePlaylistStore((s) => s.recentTracks);
  const removeFromRecentTracks = usePlaylistStore((s) => s.removeFromRecentTracks);
  const playlists = usePlaylistStore((s) => s.playlists);
  const { playTrack } = usePlayerStore();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';

  const textColor = isDark ? '#E5E5E5' : '#111827';
  const subText = isDark ? '#9CA3AF' : '#6B7280';

  const userPlaylists = playlists.filter(
    (p) => p.id !== 'favorites' && p.id !== 'history' && p.tracks.length > 0
  );

  return (
    <div className="pt-[env(safe-area-inset-top)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold" style={{ color: textColor }}>
          Music Player
        </h1>
      </div>

      {/* Search bar link */}
      <Link href="/search" className="block px-4 mb-5">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          }}
        >
          <Search size={18} color={subText} />
          <span className="text-sm" style={{ color: subText }}>
            曲名、アーティストを検索
          </span>
        </div>
      </Link>

      {/* Trend Player */}
      <TrendPlayer />

      {/* Recent Tracks */}
      {recentTracks.length > 0 && (
        <section className="mb-6">
          <div className="px-4 mb-3">
            <h2 className="text-base font-bold" style={{ color: textColor }}>最近再生した曲</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2">
            {recentTracks.slice(0, 10).map((track) => (
              <div
                key={track.id}
                className="flex-shrink-0 w-[140px] cursor-pointer active:scale-95 transition-transform"
                onClick={() => playTrack(track, recentTracks)}
              >
                <div className="relative w-[140px] h-[140px] rounded-2xl overflow-hidden mb-2 shadow-lg">
                  <img src={track.thumbnail} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromRecentTracks(track.id);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    style={{
                      background: 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <X size={14} color="#FFFFFF" />
                  </button>
                </div>
                <p className="text-xs font-medium truncate" style={{ color: textColor }}>
                  {track.title}
                </p>
                <p className="text-[10px] truncate" style={{ color: subText }}>
                  {track.artist}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* User Playlists */}
      {userPlaylists.length > 0 && (
        <section className="px-4 mb-6">
          <h2 className="text-base font-bold mb-3" style={{ color: textColor }}>
            あなたのプレイリスト
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {userPlaylists.slice(0, 4).map((pl) => (
              <Link key={pl.id} href={`/playlists/${pl.id}`}>
                <div
                  className="rounded-2xl p-3 active:scale-[0.98] transition-transform"
                  style={{ background: isDark ? '#16213E' : '#F3F4F6' }}
                >
                  <div className="flex items-center gap-3">
                    {pl.tracks[0] ? (
                      <img
                        src={pl.tracks[0].thumbnail}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl"
                        style={{ background: isDark ? '#1A1A2E' : '#E5E7EB' }}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: textColor }}>
                        {pl.name}
                      </p>
                      <p className="text-xs" style={{ color: subText }}>{pl.tracks.length}曲</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {recentTracks.length === 0 && (
        <div className="px-4 py-12 text-center">
          <p className="text-sm" style={{ color: subText }}>
            トレンドMIXを再生するか、検索して音楽を見つけましょう
          </p>
        </div>
      )}
    </div>
  );
}
