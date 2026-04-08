'use client';

import { useStatsStore } from '@/stores/statsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { BarChart3, Clock, Music, User, Trash2 } from 'lucide-react';

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}秒`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}分`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}時間${m}分`;
}

export function StatsView() {
  const { totalListenTime, getTopArtists, getTopTracks, getListeningByHour, getWeeklyTime, clearStats } = useStatsStore();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';

  const accent = isDark ? '#00D4AA' : '#059669';
  const textColor = isDark ? '#E5E5E5' : '#111827';
  const subText = isDark ? '#9CA3AF' : '#6B7280';
  const surface = isDark ? '#1A1A2E' : '#F3F4F6';

  const topArtists = getTopArtists(5);
  const topTracks = getTopTracks(5);
  const hourlyData = getListeningByHour();
  const weeklyTime = getWeeklyTime();
  const maxHour = Math.max(...hourlyData, 1);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: surface }}>
          <Clock size={18} color={accent} className="mb-2" />
          <p className="text-lg font-bold" style={{ color: textColor }}>
            {formatDuration(totalListenTime)}
          </p>
          <p className="text-[10px]" style={{ color: subText }}>総再生時間</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: surface }}>
          <Music size={18} color={accent} className="mb-2" />
          <p className="text-lg font-bold" style={{ color: textColor }}>
            {formatDuration(weeklyTime)}
          </p>
          <p className="text-[10px]" style={{ color: subText }}>今週の再生時間</p>
        </div>
      </div>

      {/* Hourly listening chart */}
      <div className="rounded-2xl p-4" style={{ background: surface }}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} color={accent} />
          <p className="text-sm font-medium" style={{ color: textColor }}>時間帯別リスニング</p>
        </div>
        <div className="flex items-end gap-[3px] h-16">
          {hourlyData.map((val, i) => (
            <div
              key={i}
              className="flex-1 rounded-t transition-all"
              style={{
                height: `${Math.max((val / maxHour) * 100, 2)}%`,
                background: val > 0 ? accent : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                opacity: val > 0 ? 0.4 + (val / maxHour) * 0.6 : 1,
              }}
              title={`${i}時: ${formatDuration(val)}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px]" style={{ color: subText }}>0時</span>
          <span className="text-[9px]" style={{ color: subText }}>6時</span>
          <span className="text-[9px]" style={{ color: subText }}>12時</span>
          <span className="text-[9px]" style={{ color: subText }}>18時</span>
          <span className="text-[9px]" style={{ color: subText }}>24時</span>
        </div>
      </div>

      {/* Top Artists */}
      {topArtists.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: surface }}>
          <div className="flex items-center gap-2 mb-3">
            <User size={16} color={accent} />
            <p className="text-sm font-medium" style={{ color: textColor }}>よく聴くアーティスト</p>
          </div>
          <div className="space-y-2">
            {topArtists.map((artist, i) => (
              <div key={artist.name} className="flex items-center gap-3">
                <span className="text-xs font-bold w-5 text-right" style={{ color: accent }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: textColor }}>
                    {artist.name}
                  </p>
                </div>
                <span className="text-[10px]" style={{ color: subText }}>
                  {artist.count}回 / {formatDuration(artist.totalTime)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Tracks */}
      {topTracks.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: surface }}>
          <div className="flex items-center gap-2 mb-3">
            <Music size={16} color={accent} />
            <p className="text-sm font-medium" style={{ color: textColor }}>よく聴く曲</p>
          </div>
          <div className="space-y-2">
            {topTracks.map((track, i) => (
              <div key={track.id} className="flex items-center gap-3">
                <span className="text-xs font-bold w-5 text-right" style={{ color: accent }}>
                  {i + 1}
                </span>
                <img src={track.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: textColor }}>
                    {track.title}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: subText }}>
                    {track.artist}
                  </p>
                </div>
                <span className="text-[10px]" style={{ color: subText }}>{track.count}回</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No data state */}
      {topArtists.length === 0 && totalListenTime === 0 && (
        <div className="text-center py-8">
          <BarChart3 size={32} color={subText} className="mx-auto opacity-30 mb-2" />
          <p className="text-xs" style={{ color: subText }}>
            音楽を聴くと統計が表示されます
          </p>
        </div>
      )}

      {/* Clear stats */}
      {totalListenTime > 0 && (
        <button
          onClick={clearStats}
          className="flex items-center gap-2 text-xs py-2 mx-auto"
          style={{ color: subText }}
        >
          <Trash2 size={12} />
          統計をリセット
        </button>
      )}
    </div>
  );
}
