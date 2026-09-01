export type AppType = 'messenger' | 'facebook' | 'instagram' | 'tiktok' | 'messages';
export type CardTheme = 'dark' | 'glass' | 'pitchBlack';
export type AspectRatioType = 'auto' | '16:9' | '1:1' | 'original';

export interface NotificationItem {
  id: string;
  pageTitle: string;
  timestamp: string;
  caption: string;
  appType: AppType;
}

export interface CaptionConfig {
  mode: 'single' | 'double';
  notifications: NotificationItem[];
  fontSize: number;
  autoFontSize: boolean;
  cardTheme: CardTheme;
  aspectRatio: AspectRatioType;
}

export interface PresetItem {
  id: string;
  title: string;
  caption: string;
  category: string;
  timestamp?: string;
}
