export type AppType = 'messenger' | 'facebook' | 'instagram' | 'tiktok' | 'messages';
export type CardTheme = 'dark' | 'glass' | 'pitchBlack';
export type AspectRatioType = 'auto' | '16:9' | '1:1' | 'original';
export type TemplateType = 'notification' | 'chat';
export type MessageSide = 'left' | 'right';

export interface NotificationItem {
  id: string;
  pageTitle: string;
  timestamp: string;
  caption: string;
  appType: AppType;
}

export interface ChatMessage {
  id: string;
  side: MessageSide;
  text: string;
}

export interface CaptionConfig {
  templateType: TemplateType;
  
  // Background Customization
  customBgUrl?: string | null;
  bgOverlayOpacity: number; // 0 to 1
  bgBlur: number; // 0 to 30

  // Notification Mode Settings
  mode: 'single' | 'double';
  notifications: NotificationItem[];
  fontSize: number;
  autoFontSize: boolean;
  cardTheme: CardTheme;
  aspectRatio: AspectRatioType;

  // Chat Mode Settings
  chatMessages: ChatMessage[];
  showBottomBar: boolean;
}

export interface PresetItem {
  id: string;
  title: string;
  caption: string;
  category: string;
  timestamp?: string;
}
