'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, ListMusic, Settings } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';

const navItems = [
  { href: '/', icon: Home, label: 'ホーム' },
  { href: '/search', icon: Search, label: '検索' },
  { href: '/playlists', icon: ListMusic, label: 'プレイリスト' },
  { href: '/settings', icon: Settings, label: '設定' },
];

export function BottomNav() {
  const pathname = usePathname();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{
        background: isDark ? 'rgba(13, 13, 13, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
          const activeColor = isDark ? '#00D4AA' : '#059669';
          const inactiveColor = isDark ? '#9CA3AF' : '#6B7280';

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px]"
            >
              <Icon
                size={22}
                color={isActive ? activeColor : inactiveColor}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? activeColor : inactiveColor }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
