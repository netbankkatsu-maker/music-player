export const AGE_GROUPS = [
  { label: 'すべて', value: 'all' },
  { label: '10代', value: '10s' },
  { label: '20代', value: '20s' },
  { label: '30代', value: '30s' },
  { label: '40代', value: '40s' },
  { label: '50代', value: '50s' },
  { label: '60代', value: '60s' },
] as const;

export const GENRES = [
  { label: 'J-POP', value: 'jpop' },
  { label: '洋楽', value: 'western' },
  { label: 'K-POP', value: 'kpop' },
  { label: 'アニソン', value: 'anime' },
  { label: 'ボカロ', value: 'vocaloid' },
  { label: 'Hip-Hop', value: 'hiphop' },
  { label: 'R&B', value: 'rnb' },
  { label: 'ロック', value: 'rock' },
] as const;

const AGE_KEYWORDS: Record<string, string> = {
  all: '人気 ヒット 音楽',
  '10s': '2024 2025 TikTok バズ 最新',
  '20s': '2020s ヒット 人気 チャート',
  '30s': '2010年代 ヒット 名曲',
  '40s': '90年代 2000年代 懐メロ',
  '50s': '80年代 90年代 昭和 名曲',
  '60s': '70年代 80年代 昭和 演歌 名曲',
};

const GENRE_KEYWORDS: Record<string, string> = {
  jpop: 'J-POP 邦楽',
  western: '洋楽 Billboard',
  kpop: 'K-POP 韓国',
  anime: 'アニソン アニメ 主題歌',
  vocaloid: 'ボカロ VOCALOID 初音ミク',
  hiphop: 'Hip-Hop ラップ 日本語ラップ',
  rnb: 'R&B ソウル',
  rock: 'ロック バンド',
};

export function buildTrendQuery(ageGroup: string, genre?: string): string {
  const ageKeyword = AGE_KEYWORDS[ageGroup] || AGE_KEYWORDS.all;
  const genreKeyword = genre ? GENRE_KEYWORDS[genre] || '' : '';
  return `${genreKeyword} ${ageKeyword} MV`.trim();
}
