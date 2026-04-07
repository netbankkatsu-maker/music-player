'use client';

import { Moon, Sun, Volume2, Trash2, RotateCcw, Info } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { usePlaylistStore } from '@/stores/playlistStore';

export default function SettingsPage() {
  const { theme, toggleTheme, quality, setQuality, resetSettings } = useSettingsStore();
  const { clearRecentTracks, clearAllData } = usePlaylistStore();
  const isDark = theme === 'dark';

  const textColor = isDark ? '#E5E5E5' : '#111827';
  const subText = isDark ? '#9CA3AF' : '#6B7280';
  const accent = isDark ? '#00D4AA' : '#059669';
  const cardBg = isDark ? '#16213E' : '#F3F4F6';
  const surface = isDark ? '#1A1A2E' : '#FFFFFF';

  const qualities = [
    { value: 'low' as const, label: '低' },
    { value: 'medium' as const, label: '中' },
    { value: 'high' as const, label: '高' },
  ];

  return (
    <div className="pt-[env(safe-area-inset-top)]">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold" style={{ color: textColor }}>設定</h1>
      </div>

      <div className="px-4 space-y-3">
        {/* Theme toggle */}
        <div className="rounded-2xl p-4" style={{ background: cardBg }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? <Moon size={20} color={accent} /> : <Sun size={20} color={accent} />}
              <div>
                <p className="text-sm font-medium" style={{ color: textColor }}>テーマ</p>
                <p className="text-xs" style={{ color: subText }}>
                  {isDark ? 'ダークモード' : 'ライトモード'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="relative w-12 h-7 rounded-full transition-colors"
              style={{ background: isDark ? accent : '#D1D5DB' }}
            >
              <div
                className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform"
                style={{ transform: isDark ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </button>
          </div>
        </div>

        {/* Quality */}
        <div className="rounded-2xl p-4" style={{ background: cardBg }}>
          <div className="flex items-center gap-3 mb-3">
            <Volume2 size={20} color={accent} />
            <p className="text-sm font-medium" style={{ color: textColor }}>再生品質</p>
          </div>
          <div className="flex gap-2">
            {qualities.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setQuality(value)}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: quality === value ? accent : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                  color: quality === value ? '#0D0D0D' : subText,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear history */}
        <button
          onClick={clearRecentTracks}
          className="w-full rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          style={{ background: cardBg }}
        >
          <Trash2 size={20} color={subText} />
          <div>
            <p className="text-sm font-medium" style={{ color: textColor }}>再生履歴をクリア</p>
            <p className="text-xs" style={{ color: subText }}>最近再生した曲の履歴を削除</p>
          </div>
        </button>

        {/* Reset all */}
        <button
          onClick={() => {
            if (confirm('すべてのデータをリセットしますか？')) {
              clearAllData();
              resetSettings();
            }
          }}
          className="w-full rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          style={{ background: cardBg }}
        >
          <RotateCcw size={20} color="#ef4444" />
          <div>
            <p className="text-sm font-medium" style={{ color: '#ef4444' }}>全データリセット</p>
            <p className="text-xs" style={{ color: subText }}>プレイリスト・設定をすべて初期化</p>
          </div>
        </button>

        {/* App info */}
        <div className="rounded-2xl p-4" style={{ background: cardBg }}>
          <div className="flex items-center gap-3">
            <Info size={20} color={subText} />
            <div>
              <p className="text-sm font-medium" style={{ color: textColor }}>Music Player</p>
              <p className="text-xs" style={{ color: subText }}>バージョン 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
