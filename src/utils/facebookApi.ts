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
    const khoihukjaoConfig = { ...DEFAULT_SETTINGS.khoihukjao, ...parsed.khoihukjao };
    if (
      khoihukjaoConfig.pageId === '103867871513828' &&
      (!khoihukjaoConfig.pageName || khoihukjaoConfig.pageName === 'Khamko Production')
    ) {
      khoihukjaoConfig.pageName = 'Khoi Huk Jao';
    }
    return {
      khamko: { ...DEFAULT_SETTINGS.khamko, ...parsed.khamko },
      khoihukjao: khoihukjaoConfig,
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
    // Helper to fetch avatar safely without breaking on permission errors
    const fetchAvatarSafely = async (targetId: string, token: string): Promise<string | undefined> => {
      try {
        const picRes = await fetch(
          `https://graph.facebook.com/v19.0/${targetId}/picture?type=normal&redirect=false&access_token=${encodeURIComponent(
            token
          )}`
        );
        const picData = await picRes.json();
        return picData?.data?.url;
      } catch {
        return undefined;
      }
    };

    // 1. Inspect token via official /debug_token endpoint first
    // This endpoint works 100% without triggering error #100 on unreviewed permissions!
    try {
      const debugUrl = `https://graph.facebook.com/v19.0/debug_token?input_token=${encodeURIComponent(
        cleanToken
      )}&access_token=${encodeURIComponent(cleanToken)}`;
      const debugRes = await fetch(debugUrl);
      const debugJson = await debugRes.json();

      if (debugJson.data) {
        const d = debugJson.data;

        if (!d.is_valid) {
          return {
            success: false,
            error: 'Token ໝົດອາຍຸ ຫຼື ຖືກຍົກເລີກແລ້ວ (Token หมดอายุ กรุณากด Generate Token ใหม่)',
          };
        }

        // If this is a PAGE Token
        if (d.type === 'PAGE') {
          const targetPageId = d.profile_id || cleanPageId;
          let pageTitle = brandHint === 'khoihukjao' ? 'Khoi Huk Jao' : (brandHint === 'khamko' ? 'Khamko Production' : 'Facebook Page');
          try {
            const pageRes = await fetch(
              `https://graph.facebook.com/v19.0/${targetPageId}?fields=id,name&access_token=${encodeURIComponent(
                cleanToken
              )}`
            );
            const pageData = await pageRes.json();
            if (pageData?.name) {
              pageTitle = pageData.name;
            }
          } catch {
            // fallback
          }

          if (brandHint === 'khoihukjao' && (!pageTitle || pageTitle === 'Khamko Production')) {
            pageTitle = 'Khoi Huk Jao';
          }

          const scopes = d.scopes || [];

          // Verify if it has posting capability
          const hasPostPermission = scopes.includes('pages_manage_posts');

          if (!hasPostPermission) {
            return {
              success: false,
              error: `⚠️ Token ນີ້ຖືກຕ້ອງຂອງเพจ "${pageTitle}" ແລ້ວ ແຕ່ຍັງຂາດສິດ "pages_manage_posts"!\n\n👉 ວິທີເພີ່ມ: ໃນໜ້າ Graph API Explorer, ບ່ອນຊ່ອງ "เพิ่มสิทธิ์การอนุญาต" ໃຫ້ພິມຄົ້ນຫາ "pages_manage_posts" ແລ້ວກົດເລືອກ ➔ ກົດປຸ່ມສີຟ້າ "Generate Access Token" ອີກຄັ້ງເດີ!`,
            };
          }

          const avatarUrl = await fetchAvatarSafely(targetPageId, cleanToken);
          return {
            success: true,
            pageId: targetPageId,
            pageName: pageTitle,
            avatarUrl,
            note: '✨ ເຊື່ອມຕໍ່ສຳເລັດ 100%! Token ມີສິດ pages_manage_posts ພ້ອມໂພສ ແລະ ຕັ້ງເວລາລົງ Planner ໄດ້ເລີຍ.',
          };
        }
      }
    } catch {
      // Continue to fallback checks if debug_token is not reachable
    }

    // 2. Fallback to /me endpoint with basic fields (id, name)
    let meData: any = null;
    try {
      const meUrl = `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${encodeURIComponent(
        cleanToken
      )}`;
      const meRes = await fetch(meUrl);
      meData = await meRes.json();
    } catch {
      // ignore
    }

    if (meData && !meData.error && cleanPageId && meData.id === cleanPageId) {
      const avatarUrl = await fetchAvatarSafely(meData.id, cleanToken);
      return {
        success: true,
        pageId: meData.id,
        pageName: meData.name,
        avatarUrl,
      };
    }

    // 3. Auto-Resolve via /me/accounts (Handles User Token automatically!)
    try {
      const accountsUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token&limit=50&access_token=${encodeURIComponent(
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
          const avatarUrl = await fetchAvatarSafely(matched.id, matched.access_token);
          return {
            success: true,
            pageId: matched.id,
            pageName: matched.name,
            resolvedPageToken: matched.access_token,
            avatarUrl,
            isAutoResolved: true,
            note: `✨ ລະບົບໄດ້ດຶງ Page Access Token ຂອງ "${matched.name}" ໃຫ້ອັດຕະໂນມັດແລ້ວ! (ระบบแปลงเป็น Page Token ให้อัตโนมัติ)`,
          };
        }
      }
    } catch {
      // Continue to next checks if /me/accounts fails
    }

    // 4. If cleanPageId was provided, try fetching the page directly (fields=id,name only)
    if (cleanPageId) {
      const pageUrl = `https://graph.facebook.com/v19.0/${cleanPageId}?fields=id,name&access_token=${encodeURIComponent(
        cleanToken
      )}`;

      const pageRes = await fetch(pageUrl);
      const pageData = await pageRes.json();

      if (pageData.error) {
        if (pageData.error.code === 100 || pageData.error.message?.includes('pages_read_engagement')) {
          const userName = meData?.name ? ` ("${meData.name}")` : '';
          return {
            success: false,
            error: `⚠️ ລະຫັດນີ້ແມ່ນ User Token ຂອງບັນຊີສ່ວນຕົວ${userName}, ບໍ່ແມ່ນ Page Token ຂອງເພຈ!\n\n👉 ວິທີງ່າຍທີ່ສຸດ: ໃນໜ້າ Graph API Explorer ໃຫ້ກົດ Run "me/accounts" ແລ້ວ Copy ລະຫັດ "access_token" ທີ່ຢູ່ກ້ອງຊື່ເພຈມາວາງເດີ!`,
          };
        }
        return {
          success: false,
          error: pageData.error.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນເພຈໄດ້',
        };
      }

      const avatarUrl = await fetchAvatarSafely(pageData.id || cleanPageId, cleanToken);
      return {
        success: true,
        pageId: pageData.id || cleanPageId,
        pageName: pageData.name || meData?.name,
        avatarUrl,
      };
    }

    // 5. If no pageId was provided but /me returned an entity with id & name
    if (meData && !meData.error && meData.id) {
      const avatarUrl = await fetchAvatarSafely(meData.id, cleanToken);
      return {
        success: true,
        pageId: meData.id,
        pageName: meData.name,
        avatarUrl,
      };
    }

    return {
      success: false,
      error: 'ບໍ່ສາມາດຢືນຢັນ Token ນີ້ໄດ້ (ไม่สามารถตรวจสอบ Token นี้ได้ กรุณาสร้างใหม่)',
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
  caption?: string;
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

  // 1. If Publish Immediately
  if (!scheduledPublishTime) {
    try {
      const formData = new FormData();
      formData.append('access_token', cleanToken);
      formData.append('source', imageBlob, 'caption_meme.png');
      if (caption && caption.trim()) {
        formData.append('message', caption.trim());
      }
      formData.append('published', 'true');

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

  // 2. If Scheduled Publishing (Targeting Meta Business Suite Planner):
  // Timing validation
  const nowInSec = Math.floor(Date.now() / 1000);
  const minTime = nowInSec + 10 * 60; // 10 minutes in future
  const maxTime = nowInSec + 28 * 24 * 60 * 60; // 28 days in future (Facebook Page Feed strict limit)

  if (scheduledPublishTime < minTime) {
    return {
      success: false,
      error: 'ເວລາຕັ້ງໂພສລ່ວງໜ້າ ຕ້ອງຫຼາຍກວ່າ 10 ນາທີ ນັບຈາກເວລານີ້ (เวลาที่ตั้งล่วงหน้าต้องมากกว่า 10 นาที)',
    };
  }

  if (scheduledPublishTime > maxTime) {
    return {
      success: false,
      error: 'ເວລາຕັ້ງໂພສລ່ວງໜ້າ ຕ້ອງບໍ່ເກີນ 28 ມື້ (Facebook จำกัดการตั้งเวลาล่วงหน้าไม่เกิน 28 วัน)',
    };
  }

  try {
    // Step A: Upload photo as unpublished asset first to get photo ID
    const photoForm = new FormData();
    photoForm.append('access_token', cleanToken);
    photoForm.append('source', imageBlob, 'caption_meme.png');
    photoForm.append('published', 'false');

    const photoRes = await fetch(`https://graph.facebook.com/v19.0/${cleanPageId}/photos`, {
      method: 'POST',
      body: photoForm,
    });
    const photoData = await photoRes.json();

    if (photoData.error) {
      return {
        success: false,
        error: photoData.error.message || 'ບໍ່ສາມາດອັບໂຫຼດຮູບພາບໄປຍັງ Facebook ໄດ້',
      };
    }

    const photoId = photoData.id;

    // Step B: Create Scheduled Feed Post with attached_media
    // Meta Business Suite Planner & Scheduled Posts list specifically display Feed Posts!
    // NOTE: Facebook Graph API /{page-id}/feed requires the 'message' parameter.
    // When the user wants only the photo without caption text, passing a single space ' '
    // satisfies Facebook's validation while displaying purely the photo with NO visible text!
    const effectiveMessage = caption && caption.trim() ? caption.trim() : ' ';

    const feedForm = new FormData();
    feedForm.append('access_token', cleanToken);
    feedForm.append('message', effectiveMessage);
    feedForm.append('attached_media[0]', JSON.stringify({ media_fbid: photoId }));
    feedForm.append('attached_media', JSON.stringify([{ media_fbid: photoId }]));
    feedForm.append('published', 'false');
    feedForm.append('scheduled_publish_time', Math.floor(scheduledPublishTime).toString());

    const feedRes = await fetch(`https://graph.facebook.com/v19.0/${cleanPageId}/feed`, {
      method: 'POST',
      body: feedForm,
    });
    const feedData = await feedRes.json();

    if (feedData.error) {
      console.error('Facebook feed scheduling error:', feedData.error);
      return {
        success: false,
        error: feedData.error.message || 'ບໍ່ສາມາດຕັ້ງເວລາລົງ Planner ໄດ້',
      };
    }

    return {
      success: true,
      postId: feedData.id,
    };

    return {
      success: true,
      postId: feedData.id,
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
  isTooFarInFuture: boolean;
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
  const maxFutureSec = nowSec + 28 * 24 * 60 * 60; // Facebook strict limit <= 28 days

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
      isTooFarInFuture: scheduledTimestampSec > maxFutureSec,
    });

    currentSlotIdx++;
    if (currentSlotIdx >= slots.length) {
      currentSlotIdx = 0;
      currentDayOffset++;
    }
  }

  return result;
}
