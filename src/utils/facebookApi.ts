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
export interface TestConnectionResult {
  success: boolean;
  pageId?: string;
  pageName?: string;
  avatarUrl?: string;
  resolvedPageToken?: string;
  isAutoResolved?: boolean;
  note?: string;
  error?: string;
}

/**
 * Test Connection with Meta Graph API
 * Supports both Page Access Token and User Access Token (auto-resolves Page Token via /me/accounts)
 */
export async function testFacebookConnection(
  pageId: string,
  accessToken: string,
  brandHint?: 'khamko' | 'khoihukjao' | string
): Promise<TestConnectionResult> {
  const cleanPageId = pageId.trim();
  const cleanToken = accessToken.trim();

  if (!cleanToken) {
    return {
      success: false,
      error: 'ກະລຸນາປ້ອນ Access Token (กรุณากรอก Access Token จาก Meta Explorer)',
    };
  }

  try {
    // 1. First test /me endpoint with the token
    const meUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,picture{url}&access_token=${encodeURIComponent(
      cleanToken
    )}`;

    const meRes = await fetch(meUrl);
    const meData = await meRes.json();

    if (meData.error) {
      if (meData.error.code === 190) {
        return {
          success: false,
          error: 'Token ໝົດອາຍຸ ຫຼື ບໍ່ຖືກຕ້ອງ (Token หมดอายุหรือไม่ถูกต้อง กรุณากด Generate ใหม่)',
        };
      }
      return {
        success: false,
        error: meData.error.message || 'ບໍ່ສາມາດເຊື່ອມຕໍ່ Facebook Graph API ໄດ້',
      };
    }

    // 2. If /me returned an ID that matches the pageId, it is definitely a valid direct Page Token!
    if (cleanPageId && meData.id === cleanPageId) {
      return {
        success: true,
        pageId: meData.id,
        pageName: meData.name,
        avatarUrl: meData.picture?.data?.url,
      };
    }

    // 3. Auto-Resolve via /me/accounts (Handles User Token automatically!)
    try {
      const accountsUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,picture{url}&limit=50&access_token=${encodeURIComponent(
        cleanToken
      )}`;
      const accountsRes = await fetch(accountsUrl);
      const accountsData = await accountsRes.json();

      if (accountsData.data && Array.isArray(accountsData.data) && accountsData.data.length > 0) {
        // Find matching page by ID
        let matched = accountsData.data.find((p: any) => cleanPageId && p.id === cleanPageId);

        // If not matched by cleanPageId, find by brand hint or name
        if (!matched) {
          if (brandHint === 'khamko') {
            matched = accountsData.data.find(
              (p: any) =>
                p.id === '105280994711324' ||
                p.name.toLowerCase().includes('khamko')
            );
          } else if (brandHint === 'khoihukjao' || brandHint === 'khoiHukJao') {
            matched = accountsData.data.find(
              (p: any) =>
                p.name.toLowerCase().includes('khoi') ||
                p.name.toLowerCase().includes('huk') ||
                p.name.includes('ຂ້ອຍຮັກເຈົ້າ')
            );
          }
        }

        // Fallback: If only 1 page exists or no specific brand filter, pick the first
        if (!matched && accountsData.data.length === 1) {
          matched = accountsData.data[0];
        }

        if (matched && matched.access_token) {
          return {
            success: true,
            pageId: matched.id,
            pageName: matched.name,
            resolvedPageToken: matched.access_token,
            avatarUrl: matched.picture?.data?.url,
            isAutoResolved: true,
            note: `✨ ລະບົບໄດ້ດຶງ Page Access Token ຂອງ "${matched.name}" ໃຫ້ອັດຕະໂນມັດແລ້ວ! (ระบบแปลงเป็น Page Token ให้อัตโนมัติ)`,
          };
        }
      }
    } catch {
      // Continue to next checks if /me/accounts fails
    }

    // 4. If cleanPageId was provided, try fetching the page directly
    if (cleanPageId) {
      const pageUrl = `https://graph.facebook.com/v19.0/${cleanPageId}?fields=id,name,picture{url}&access_token=${encodeURIComponent(
        cleanToken
      )}`;

      const pageRes = await fetch(pageUrl);
      const pageData = await pageRes.json();

      if (pageData.error) {
        if (pageData.error.code === 100 || pageData.error.message?.includes('pages_read_engagement')) {
          return {
            success: false,
            error: `⚠️ ລະຫັດນີ້ແມ່ນ User Token ຂອງບັນຊີສ່ວນຕົວ ("${meData.name}"), ບໍ່ແມ່ນ Page Token ຂອງເພຈ!\n\n👉 ວິທີງ່າຍທີ່ສຸດ: ໃນໜ້າ Graph API Explorer ໃຫ້ກົດ Run "me/accounts" ແລ້ວ Copy ລະຫັດ "access_token" ທີ່ຢູ່ກ້ອງຊື່ເພຈມາວາງເດີ!`,
          };
        }
        return {
          success: false,
          error: pageData.error.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນເພຈໄດ້',
        };
      }

      return {
        success: true,
        pageId: pageData.id || cleanPageId,
        pageName: pageData.name || meData.name,
        avatarUrl: pageData.picture?.data?.url || meData.picture?.data?.url,
      };
    }

    // 5. If no pageId was provided but /me returned an entity with id & name
    return {
      success: true,
      pageId: meData.id,
      pageName: meData.name,
      avatarUrl: meData.picture?.data?.url,
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
