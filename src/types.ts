export type AppType = 'messenger' | 'facebook' | 'instagram' | 'tiktok' | 'messages';
export type CardTheme = 'dark' | 'glass' | 'pitchBlack';
export type AspectRatioType = 'auto' | '16:9' | '1:1' | 'original';

export interface CaptionConfig {
  pageTitle: string;
  timestamp: string;
  caption: string;
  fontSize: number;
  autoFontSize: boolean;
  appType: AppType;
  cardTheme: CardTheme;
  aspectRatio: AspectRatioType;
  customHeight?: number;
  showVerifiedBadge?: boolean;
}

export interface PresetItem {
  id: string;
  title: string;
  caption: string;
  category: string;
  author?: string;
  timestamp?: string;
}
