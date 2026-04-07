'use client';

import { useState, useCallback, useRef } from 'react';
import { Search, X, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { searchYouTube } from '@/lib/youtube';
import { TrackCard } from '@/components/TrackCard';
import { usePlaylistStore } from '@/stores/playlistStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { SearchResult, Track } from '@/types';
import { PlaylistSelectModal } from '@/components/PlaylistSelectModal';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { searchHistory, addToSearchHistory, clearSearchHistory } = usePlaylistStore();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';

  const textColor = isDark ? '#E5E5E5' : '#111827';
  const subText = isDark ? '#9CA3AF' : '#6B7280';
  const accent = isDark ? '#00D4AA' : '#059669';

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;
    setIsLoading(true);
    addToSearchHistory(q.trim());
    try {
      const res = await searchYouTube(q.trim());
      setResults(res);
    } catch (err) {
      console.error('Search failed:', err);
    }
    setIsLoading(false);
  }, [query, addToSearchHistory]);

  const filteredHistory = query
    ? searchHistory.filter((h) => h.toLowerCase().includes(query.toLowerCase()))
    : searchHistory;

  const tracks: Track[] = results.map((r) => ({
    id: r.id,
    title: r.title,
    artist: r.artist,
    thumbnail: r.thumbnail,
    duration: r.duration,
  }));

  return (
    <div className="pt-[env(safe-area-inset-top)]">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-3">
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
          style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          }}
        >
          <Search size={18} color={subText} />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="曲名、アーティストを検索"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: textColor }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); }}>
              <X size={18} color={subText} />
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} color={accent} className="animate-spin" />
        </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <div className="px-4">
          <p className="text-xs mb-2" style={{ color: subText }}>
            {results.length}件の結果
          </p>
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              queue={tracks}
              onAddToPlaylist={(t) => setSelectedTrack(t)}
            />
          ))}
        </div>
      )}

      {/* Search history */}
      {!isLoading && results.length === 0 && filteredHistory.length > 0 && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium" style={{ color: textColor }}>検索履歴</p>
            <button
              onClick={clearSearchHistory}
              className="text-xs"
              style={{ color: accent }}
            >
              すべて消去
            </button>
          </div>
          {filteredHistory.map((item, i) => (
            <button
              key={i}
              onClick={() => { setQuery(item); handleSearch(item); }}
              className="flex items-center gap-3 w-full py-2.5 text-left"
            >
              <Clock size={16} color={subText} />
              <span className="text-sm" style={{ color: textColor }}>{item}</span>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && results.length === 0 && filteredHistory.length === 0 && !query && (
        <div className="flex flex-col items-center justify-center py-20">
          <Search size={48} color={subText} className="opacity-30 mb-4" />
          <p className="text-sm" style={{ color: subText }}>曲を検索してみましょう</p>
        </div>
      )}

      {/* Playlist select modal */}
      {selectedTrack && (
        <PlaylistSelectModal
          track={selectedTrack}
          onClose={() => setSelectedTrack(null)}
        />
      )}
    </div>
  );
}
