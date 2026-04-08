// AI/Mood search: maps natural language queries to YouTube search terms

const MOOD_MAP: Record<string, string[]> = {
  // Emotions
  '悲しい': ['泣ける曲 バラード 切ない', '失恋ソング 泣ける'],
  '泣ける': ['泣ける曲 感動 バラード', '泣けるJ-POP'],
  '失恋': ['失恋ソング 切ない バラード', '失恋 泣ける曲'],
  '元気': ['元気が出る曲 アップテンポ 明るい', 'テンション上がる 邦楽'],
  'テンション': ['テンション上がる曲 盛り上がる', 'アゲアゲ ノリノリ'],
  '楽しい': ['楽しい曲 ハッピー ポップ', '明るい曲 パーティー'],
  '癒し': ['癒しの曲 ヒーリング リラックス', '穏やかな曲 BGM'],
  'リラックス': ['リラックス チル BGM 落ち着く', 'Lo-Fi チル'],
  'エモい': ['エモい曲 エモ 邦楽', 'エモーショナル 名曲'],
  '切ない': ['切ない曲 バラード 泣ける', '切ないメロディー J-POP'],
  '寂しい': ['寂しい時に聴く曲 夜 バラード', '孤独 切ない曲'],
  '恋': ['恋愛ソング ラブソング 胸キュン', '恋の歌 J-POP'],
  '片思い': ['片思いソング 切ない 恋愛', '片思い J-POP'],
  '感動': ['感動する曲 泣ける 名曲', '感動ソング 卒業'],

  // Activities
  'ドライブ': ['ドライブ BGM 爽快 アップテンポ', 'ドライブミュージック 邦楽'],
  '勉強': ['勉強 集中 BGM インスト', '作業用BGM Lo-Fi'],
  '作業': ['作業用BGM 集中 カフェ', '仕事 集中 インストゥルメンタル'],
  '集中': ['集中できる曲 BGM インスト', 'フォーカス 作業用'],
  '筋トレ': ['筋トレ ワークアウト BPM高め', 'トレーニング モチベーション EDM'],
  'ランニング': ['ランニング BPM テンポ速い', 'ジョギング ワークアウト 邦楽'],
  '料理': ['料理 BGM おしゃれ カフェ', 'クッキング BGM'],
  'カフェ': ['カフェ BGM おしゃれ ジャズ', 'カフェミュージック ボサノバ'],
  '散歩': ['散歩 BGM 心地よい ポップ', 'お散歩ミュージック 爽やか'],
  '通勤': ['通勤 朝 BGM 爽やか', '朝の音楽 元気が出る'],

  // Time/Season
  '朝': ['朝 目覚め 爽やか BGM', 'モーニング ポップ 元気'],
  '夜': ['夜 チル リラックス', '深夜 バラード ムーディー'],
  '眠れない': ['眠れない夜 バラード 深夜', 'スリープ BGM 安眠'],
  '夏': ['夏うた サマーソング 海', '夏の名曲 J-POP'],
  '冬': ['冬うた ウィンターソング クリスマス', '冬の名曲 バラード'],
  '春': ['春うた 卒業ソング 桜', '春の歌 新生活'],
  '秋': ['秋うた 紅葉 切ない', '秋の名曲 バラード'],
  '雨': ['雨の日 しっとり バラード', '雨 チル 邦楽'],

  // Genres/Vibes
  'おしゃれ': ['おしゃれ シティポップ 洗練', 'スタイリッシュ J-POP'],
  'レトロ': ['レトロ 昭和 シティポップ', '80年代 90年代 名曲'],
  'チル': ['チル Lo-Fi ビート リラックス', 'Chill Hop 日本語'],
  'エレクトロ': ['エレクトロ EDM テクノ 日本', 'エレクトロニック J-POP'],
  'アコースティック': ['アコースティック 弾き語り ギター', 'アコースティックカバー 邦楽'],
  'ジャズ': ['ジャズ JAZZ 日本 おしゃれ', 'ジャズ BGM'],
  'クラシック': ['クラシック ピアノ 名曲', 'クラシック BGM 有名'],
  'ボサノバ': ['ボサノバ カフェ BGM おしゃれ', 'Bossa Nova 日本語'],
};

// Keywords that indicate an AI/mood search vs regular search
const MOOD_INDICATORS = [
  '聴きたい', 'ききたい', '気分', 'ムード', 'mood',
  '時に', 'ときに', '用', 'BGM', 'bgm',
  'おすすめ', 'オススメ', 'みたいな', '系',
  '曲', 'うた', '歌', 'ソング', '音楽',
];

export interface AISearchResult {
  isAISearch: boolean;
  queries: string[];
  mood: string;
}

export function analyzeQuery(input: string): AISearchResult {
  const normalized = input.toLowerCase().trim();

  // Check if input matches any mood keywords
  for (const [mood, queries] of Object.entries(MOOD_MAP)) {
    if (normalized.includes(mood.toLowerCase())) {
      return { isAISearch: true, queries, mood };
    }
  }

  // Check if it looks like a mood/activity search (has mood indicators)
  const hasMoodIndicator = MOOD_INDICATORS.some((ind) =>
    normalized.includes(ind.toLowerCase())
  );

  if (hasMoodIndicator) {
    // Try to extract useful keywords and build a query
    return {
      isAISearch: true,
      queries: [`${input} おすすめ 人気`, `${input} プレイリスト`],
      mood: input,
    };
  }

  return { isAISearch: false, queries: [], mood: '' };
}

// Scene-based playlist presets
export const SCENE_PRESETS = [
  { label: '朝の目覚め', icon: '🌅', query: '朝 爽やか BGM 元気が出る J-POP' },
  { label: '通勤・通学', icon: '🚃', query: '通勤 アップテンポ 邦楽 人気' },
  { label: '集中・勉強', icon: '📚', query: '作業用BGM 集中 Lo-Fi カフェ' },
  { label: 'カフェタイム', icon: '☕', query: 'カフェ BGM おしゃれ ジャズ ボサノバ' },
  { label: 'ドライブ', icon: '🚗', query: 'ドライブ BGM 爽快 J-POP アップテンポ' },
  { label: '筋トレ', icon: '💪', query: 'ワークアウト 筋トレ BGM テンション上がる' },
  { label: '雨の日', icon: '🌧️', query: '雨の日 しっとり チル バラード 邦楽' },
  { label: 'おやすみ前', icon: '🌙', query: '眠れる曲 リラックス BGM スリープ' },
  { label: '恋してる', icon: '💕', query: 'ラブソング 恋愛 胸キュン J-POP' },
  { label: '泣きたい夜', icon: '😢', query: '泣ける曲 バラード 失恋 感動' },
  { label: 'パーティー', icon: '🎉', query: 'パーティー 盛り上がる ダンス EDM 邦楽' },
  { label: 'エモい気分', icon: '🌃', query: 'エモい曲 夜 チル シティポップ' },
] as const;
