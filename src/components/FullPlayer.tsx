'use client';

import { useCallback, useState } from 'react';
import {
  ChevronDown, Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Heart, ListMusic, Timer, Volume2, MicVocal, Share2, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '@/stores/playerStore';
import { usePlaylistStore } from '@/stores/playlistStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatTime } from '@/lib/utils';
import { QueueView } from './QueueView';
import { SleepTimerModal } from './SleepTimer';
import { LyricsView } from './LyricsView';

type PlayerTab = 'artwork' | 'lyrics';

export function FullPlayer() {
  const {
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack,
    currentTime, duration, repeatMode, toggleRepeat,
    isShuffled, toggleShuffle, isFullPlayerOpen, setFullPlayerOpen,
    volume, setVolume, isRadioMode, toggleRadioMode,
  } = usePlayerStore();
  const { toggleFavorite, isFavorite } = usePlaylistStore();
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === 'dark';

  const [showQueue, setShowQueue] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [activeTab, setActiveTab] = useState<PlayerTab>('artwork');

  const seekTo = useCallback((clientX: number, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return percent * duration;
  }, [duration]);

  const handleSeekStart = useCallback((e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragTime(seekTo(clientX, e.currentTarget));
  }, [seekTo]);

  const handleSeekMove = useCallback((e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragTime(seekTo(clientX, e.currentTarget));
  }, [isDragging, seekTo]);

  const handleSeekEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    usePlayerStore.getState().setCurrentTime(dragTime);
    window.dispatchEvent(new CustomEvent('yt-seek', { detail: dragTime }));
  }, [isDragging, dragTime]);

  const displayTime = isDragging ? dragTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  const accent = isDark ? '#00D4AA' : '#059669';
  const bg = isDark ? '#0D0D0D' : '#F9FAFB';
  const textColor = isDark ? '#E5E5E5' : '#111827';
  const subText = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <AnimatePresence>
      {isFullPlayerOpen && currentTrack && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[60] flex flex-col"
          style={{ background: bg }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top)] py-4">
            <button
              onClick={() => setFullPlayerOpen(false)}
              className="p-2 -ml-2 rounded-full active:scale-90 transition-transform"
            >
              <ChevronDown size={28} color={textColor} />
            </button>
            {/* Tab switcher */}
            <div className="flex items-center gap-1 rounded-full p-1" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
              <button
                onClick={() => setActiveTab('artwork')}
                className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
                style={{
                  background: activeTab === 'artwork' ? accent : 'transparent',
                  color: activeTab === 'artwork' ? '#0D0D0D' : subText,
                }}
              >
                アートワーク
              </button>
              <button
                onClick={() => setActiveTab('lyrics')}
                className="px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1"
                style={{
                  background: activeTab === 'lyrics' ? accent : 'transparent',
                  color: activeTab === 'lyrics' ? '#0D0D0D' : subText,
                }}
              >
                <MicVocal size={12} />
                歌詞
              </button>
            </div>
            <div className="w-10" />
          </div>

          {/* Content area: Artwork or Lyrics */}
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {activeTab === 'artwork' ? (
                <motion.div
                  key="artwork"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center px-10 h-full"
                >
                  <motion.div
                    className={`w-full max-w-[320px] aspect-square rounded-3xl overflow-hidden shadow-2xl ${
                      isPlaying ? 'animate-pulse-glow' : ''
                    }`}
                    animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <img
                      src={currentTrack.thumbnail}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="lyrics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-y-auto px-4"
                >
                  <LyricsView />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Track Info + Controls */}
          <div className="px-8 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <h2 className="text-lg font-bold truncate" style={{ color: textColor }}>
                  {currentTrack.title}
                </h2>
                <p className="text-sm mt-0.5 truncate" style={{ color: subText }}>
                  {currentTrack.artist}
                </p>
              </div>
              <button
                onClick={() => toggleFavorite(currentTrack)}
                className="p-2 active:scale-90 transition-transform"
              >
                <Heart
                  size={24}
                  color={isFavorite(currentTrack.id) ? '#ef4444' : subText}
                  fill={isFavorite(currentTrack.id) ? '#ef4444' : 'none'}
                />
              </button>
            </div>

            {/* Seek Bar */}
            <div className="mt-4">
              <div
                className="relative h-6 flex items-center cursor-pointer"
                onMouseDown={handleSeekStart}
                onMouseMove={handleSeekMove}
                onMouseUp={handleSeekEnd}
                onMouseLeave={() => isDragging && handleSeekEnd()}
                onTouchStart={handleSeekStart}
                onTouchMove={handleSeekMove}
                onTouchEnd={handleSeekEnd}
              >
                <div
                  className="w-full h-1 rounded-full relative"
                  style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                >
                  <div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${progress}%`, background: accent }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg"
                    style={{
                      left: `${progress}%`,
                      transform: `translate(-50%, -50%)`,
                      background: accent,
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: subText }}>{formatTime(displayTime)}</span>
                <span className="text-xs" style={{ color: subText }}>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-between mt-3 px-4">
              <button
                onClick={toggleShuffle}
                className="p-2 active:scale-90 transition-transform"
              >
                <Shuffle size={20} color={isShuffled ? accent : subText} />
              </button>
              <button
                onClick={prevTrack}
                className="p-3 active:scale-90 transition-transform"
              >
                <SkipBack size={28} fill={textColor} color={textColor} />
              </button>
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: accent }}
              >
                {isPlaying ? (
                  <Pause size={30} fill="#0D0D0D" color="#0D0D0D" />
                ) : (
                  <Play size={30} fill="#0D0D0D" color="#0D0D0D" className="ml-1" />
                )}
              </button>
              <button
                onClick={nextTrack}
                className="p-3 active:scale-90 transition-transform"
              >
                <SkipForward size={28} fill={textColor} color={textColor} />
              </button>
              <button
                onClick={toggleRepeat}
                className="p-2 active:scale-90 transition-transform"
              >
                {repeatMode === 'one' ? (
                  <Repeat1 size={20} color={accent} />
                ) : (
                  <Repeat size={20} color={repeatMode === 'all' ? accent : subText} />
                )}
              </button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-between mt-3 mb-6 px-4">
              <button
                onClick={() => setShowSleepTimer(true)}
                className="p-2 active:scale-90 transition-transform"
              >
                <Timer size={20} color={subText} />
              </button>
              <button
                onClick={toggleRadioMode}
                className="p-2 active:scale-90 transition-transform"
                title="おまかせラジオ"
              >
                <Radio size={20} color={isRadioMode ? accent : subText} />
              </button>
              <button
                onClick={async () => {
                  if (!currentTrack) return;
                  const url = `https://www.youtube.com/watch?v=${currentTrack.id}`;
                  const text = `${currentTrack.title} - ${currentTrack.artist}`;
                  if (navigator.share) {
                    try { await navigator.share({ title: text, url }); } catch {}
                  } else {
                    await navigator.clipboard.writeText(`${text}\n${url}`);
                  }
                }}
                className="p-2 active:scale-90 transition-transform"
              >
                <Share2 size={20} color={subText} />
              </button>
              <div className="flex items-center gap-2 flex-1 mx-4">
                <Volume2 size={16} color={subText} />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${accent} ${volume}%, ${
                      isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    } ${volume}%)`,
                  }}
                />
              </div>
              <button
                onClick={() => setShowQueue(true)}
                className="p-2 active:scale-90 transition-transform"
              >
                <ListMusic size={20} color={subText} />
              </button>
            </div>
          </div>

          <div className="h-[env(safe-area-inset-bottom)]" />

          {/* Queue and Sleep Timer modals */}
          <AnimatePresence>
            {showQueue && <QueueView onClose={() => setShowQueue(false)} />}
          </AnimatePresence>
          <AnimatePresence>
            {showSleepTimer && <SleepTimerModal onClose={() => setShowSleepTimer(false)} />}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
