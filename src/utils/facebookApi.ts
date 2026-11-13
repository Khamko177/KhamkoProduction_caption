import { BrandType } from '../types';

export interface FacebookPageConfig {
  pageId: string;
  accessToken: string;
  pageName?: string;
  avatarUrl?: string;
  isConnected?: boolean;
}

export interface FacebookSettings {
  khamko: FacebookPageConfig;
  khoihukjao: FacebookPageConfig;
}

const STORAGE_KEY = 'khamko_facebook_settings_v1';

const DEFAULT_SETTINGS: FacebookSettings = {
  khamko: {
    pageId: '',
    accessToken: '',
    pageName: '',
    avatarUrl: '',
    isConnected: false,
  },
  khoihukjao: {
    pageId: '',
    accessToken: '',
    pageName: '',
    avatarUrl: '',
    isConnected: false,
  },
};

/**
 * Get Facebook settings from localStorage
 */
export function getFacebookSettings(): FacebookSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      khamko: { ...DEFAULT_SETTINGS.khamko, ...parsed.khamko },
      khoihukjao: { ...DEFAULT_SETTINGS.khoihukjao, ...parsed.khoihukjao },
    };
  } catch (err) {
    console.error('Failed to parse Facebook settings', err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save Facebook settings to localStorage
 */
export function saveFacebookSettings(settings: FacebookSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save Facebook settings', err);
  }
}

/**
 * Test Connection with Meta Graph API
 */
export async function testFacebookConnection(
  pageId: string,
  accessToken: string
): Promise<{ success: boolean; pageName?: string; avatarUrl?: string; error?: string }> {
  const cleanPageId = pageId.trim();
  const cleanToken = accessToken.trim();

  if (!cleanPageId || !cleanToken) {
    return {
      success: false,
      error: 'ກະລຸນາປ້ອນ Page ID ແລະ Access Token ໃຫ້ຄົບຖ້ວນ (กรุณากรอก Page ID และ Access Token ให้ครบถ้วน)',
    };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${cleanPageId}?fields=id,name,picture{url}&access_token=${encodeURIComponent(
      cleanToken
    )}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message || 'ບໍ່ສາມາດເຊື່ອມຕໍ່ Facebook Graph API ໄດ້',
      };
    }

    return {
      success: true,
      pageName: data.name,
      avatarUrl: data.picture?.data?.url,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ Network',
    };
  }
}

export interface PublishPhotoParams {
  pageId: string;
  accessToken: string;
  imageBlob: Blob;
  caption: string;
  /**
   * Optional UNIX timestamp in seconds (between 10 mins and 75 days in future)
   * If omitted, publishes immediately.
   */
  scheduledPublishTime?: number;
}

/**
 * Upload photo and publish/schedule to Facebook Page using Graph API
 */
export async function publishPhotoToFacebook({
  pageId,
  accessToken,
  imageBlob,
  caption,
  scheduledPublishTime,
}: PublishPhotoParams): Promise<{ success: boolean; postId?: string; error?: string }> {
  const cleanPageId = pageId.trim();
  const cleanToken = accessToken.trim();

  if (!cleanPageId || !cleanToken) {
    return {
      success: false,
      error: 'ຍັງບໍ່ທັນໄດ້ຕັ້ງຄ່າ Page ID ຫຼື Access Token ສຳລັບເພຈນີ້ເທື່ອ',
    };
  }

  const formData = new FormData();
  formData.append('access_token', cleanToken);
  formData.append('source', imageBlob, 'caption_meme.png');
  formData.append('message', caption);

  // If scheduled time is provided
  if (scheduledPublishTime) {
    const nowInSec = Math.floor(Date.now() / 1000);
    const minTime = nowInSec + 10 * 60; // 10 minutes in future
    const maxTime = nowInSec + 75 * 24 * 60 * 60; // 75 days in future

    if (scheduledPublishTime < minTime) {
      return {
        success: false,
        error: 'ເວລາຕັ້ງໂພສລ່ວງໜ້າ ຕ້ອງຫຼາຍກວ່າ 10 ນາທີ ນັບຈາກເວລານີ້ (เวลาที่ตั้งล่วงหน้าต้องมากกว่า 10 นาที)',
      };
    }

    if (scheduledPublishTime > maxTime) {
      return {
        success: false,
        error: 'ເວລາຕັ້ງໂພສລ່ວງໜ້າ ຕ້ອງບໍ່ເກີນ 75 ມື້ (เวลาที่ตั้งล่วงหน้าต้องไม่เกิน 75 วัน)',
      };
    }

    formData.append('published', 'false');
    formData.append('scheduled_publish_time', Math.floor(scheduledPublishTime).toString());
  } else {
    formData.append('published', 'true');
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${cleanPageId}/photos`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message || 'ເກີດຂໍ້ຜິດພາດຈາກ Facebook API',
      };
    }

    return {
      success: true,
      postId: data.post_id || data.id,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'ເກີດຂໍ້ຜິດພາດໃນການສົ່ງຂໍ້ມູນໄປຍັງ Facebook',
    };
  }
}

export interface DailyTimeSlot {
  id: string;
  time: string; // "HH:mm"
  label: string;
  icon: string;
  periodName: string;
}

/**
 * 5 Fixed Posting Slots per Day as requested:
 * • 07:45 (เช้า / Morning)
 * • 12:00 (เที่ยง / Noon)
 * • 17:15 (เย็น / Afternoon)
 * • 20:15 (ค่ำ / Evening)
 * • 22:45 (ดึก / Night)
 */
export const FIXED_DAILY_SLOTS: DailyTimeSlot[] = [
  { id: 'morning', time: '07:45', label: '07:45 (ຕອນເຊົ້າ)', icon: '🌅', periodName: 'ເຊົ້າ' },
  { id: 'noon', time: '12:00', label: '12:00 (ຕອນທ່ຽງ)', icon: '☀️', periodName: 'ທ່ຽງ' },
  { id: 'afternoon', time: '17:15', label: '17:15 (ຕອນແລງ)', icon: '🌇', periodName: 'ແລງ' },
  { id: 'evening', time: '20:15', label: '20:15 (ຕອນຄ່ຳ)', icon: '🌙', periodName: 'ຄ່ຳ' },
  { id: 'night', time: '22:45', label: '22:45 (ຮອບເດິກ)', icon: '🌌', periodName: 'ເດິກ' },
];

export interface PlannedScheduleItem {
  captionIndex: number;
  captionText: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  scheduledTimestampSec: number;
  slotLabel: string;
  slotIcon: string;
  slotId: string;
  isPastOrTooSoon: boolean;
}

/**
 * Computes scheduled timestamps for a list of captions based on 5 fixed daily slots
 */
export function computeDailyScheduleTimeline(
  captions: string[],
  startDateStr: string, // YYYY-MM-DD
  startSlotIndex: number = 0,
  slots: DailyTimeSlot[] = FIXED_DAILY_SLOTS
): PlannedScheduleItem[] {
  const result: PlannedScheduleItem[] = [];
  if (captions.length === 0) return result;

  const [year, month, day] = startDateStr.split('-').map(Number);
  const nowSec = Math.floor(Date.now() / 1000);
  const minFutureSec = nowSec + 10 * 60; // Facebook requires >= 10 mins in future

  let currentDayOffset = 0;
  let currentSlotIdx = Math.max(0, Math.min(startSlotIndex, slots.length - 1));

  for (let i = 0; i < captions.length; i++) {
    const targetDate = new Date(year, month - 1, day + currentDayOffset);
    const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(
      targetDate.getDate()
    ).padStart(2, '0')}`;

    const slot = slots[currentSlotIdx];
    const [hours, minutes] = slot.time.split(':').map(Number);

    const fullDateTime = new Date(year, month - 1, day + currentDayOffset, hours, minutes, 0, 0);
    const scheduledTimestampSec = Math.floor(fullDateTime.getTime() / 1000);

    result.push({
      captionIndex: i,
      captionText: captions[i],
      dateStr: targetDateStr,
      timeStr: slot.time,
      scheduledTimestampSec,
      slotLabel: slot.label,
      slotIcon: slot.icon,
      slotId: slot.id,
      isPastOrTooSoon: scheduledTimestampSec < minFutureSec,
    });

    currentSlotIdx++;
    if (currentSlotIdx >= slots.length) {
      currentSlotIdx = 0;
      currentDayOffset++;
    }
  }

  return result;
}
