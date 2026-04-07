'use client';

import { ThemeProvider } from './ThemeProvider';
import { BottomNav } from './BottomNav';
import { MiniPlayer } from './MiniPlayer';
import { FullPlayer } from './FullPlayer';
import { YouTubePlayerHost } from './YouTubePlayerHost';
import { Onboarding } from './Onboarding';
import { useSettingsStore } from '@/stores/settingsStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useSettingsStore as useSettings } from '@/stores/settingsStore';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppContent>{children}</AppContent>
    </ThemeProvider>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const theme = useSettings((s) => s.theme);
  const isDark = theme === 'dark';

  if (!hasCompletedOnboarding) {
    return <Onboarding />;
  }

  return (
    <div
      className="h-dvh flex flex-col relative"
      style={{
        background: isDark ? '#0D0D0D' : '#F9FAFB',
        color: isDark ? '#E5E5E5' : '#111827',
      }}
    >
      <YouTubePlayerHost />
      <main className="flex-1 overflow-y-auto pb-[140px]">
        {children}
      </main>
      {currentTrack && <MiniPlayer />}
      <BottomNav />
      <FullPlayer />
    </div>
  );
}
