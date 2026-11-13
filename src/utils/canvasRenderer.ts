import {
  CaptionConfig,
  AppType,
  NotificationItem,
  ChatMessage,
  BrandType
} from '../types';
import khoiHukJaoBannerUrl from '../KhoiHukJao/banner.jpg';
import tiktokFontUrl from '../KhoiHukJao/Tiktok-Regular.ttf';
import JSZip from 'jszip';

/**
 * Image Cache for fast rendering
 */
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    const cached = imageCache.get(src)!;
    if (cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Ensure custom font Tiktok-Regular is loaded into memory
 */
let tiktokFontLoaded = false;
async function ensureFontsLoaded(brand: BrandType) {
  if (brand === 'khoihukjao' && !tiktokFontLoaded) {
    try {
      if (typeof FontFace !== 'undefined') {
        const font = new FontFace('Tiktok-Regular', `url(${tiktokFontUrl})`);
        const loaded = await font.load();
        document.fonts.add(loaded);
        tiktokFontLoaded = true;
      }
    } catch (e) {
      console.warn('Could not load FontFace for Tiktok-Regular', e);
    }
  }
  try {
    await document.fonts.ready;
  } catch (e) {}
}

/**
 * Draw background:
 * - Khoi Huk Jao: Always fixed to banner.jpg
 * - Khamko Production: Solid black or Custom uploaded image with cover & overlay
 */
async function drawCanvasBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: CaptionConfig
) {
  if (config.brand === 'khoihukjao') {
    try {
      const bannerImg = await loadImage(khoiHukJaoBannerUrl);
      ctx.drawImage(bannerImg, 0, 0, width, height);
      return;
    } catch (err) {
      console.warn('Could not load Khoi Huk Jao banner, falling back to light gray', err);
      ctx.fillStyle = '#eaeaea';
      ctx.fillRect(0, 0, width, height);
      return;
    }
  }

  // Khamko Production Background logic
  if (config.customBgUrl) {
    try {
      const bgImg = await loadImage(config.customBgUrl);
      ctx.save();

      // Apply blur if requested
      if (config.bgBlur && config.bgBlur > 0) {
        ctx.filter = `blur(${config.bgBlur}px)`;
      }

      // Proportional Cover scale
      const imgRatio = bgImg.width / bgImg.height;
      const canvasRatio = width / height;
      let renderW = width;
      let renderH = height;
      let renderX = 0;
      let renderY = 0;

      if (imgRatio > canvasRatio) {
        renderH = height;
        renderW = height * imgRatio;
        renderX = (width - renderW) / 2;
      } else {
        renderW = width;
        renderH = width / imgRatio;
        renderY = (height - renderH) / 2;
      }

      // Add slight padding to prevent blur edges from showing transparent
      const expand = config.bgBlur ? config.bgBlur * 2 : 0;
      ctx.drawImage(
        bgImg,
        renderX - expand / 2,
        renderY - expand / 2,
        renderW + expand,
        renderH + expand
      );
      ctx.restore();

      // Dark Overlay so text is readable
      const opacity = typeof config.bgOverlayOpacity === 'number' ? config.bgOverlayOpacity : 0.4;
      if (opacity > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.fillRect(0, 0, width, height);
      }
      return;
    } catch (err) {
      console.warn('Could not load custom background image, fallback to black', err);
    }
  }

  // Default Solid Black Background for Khamko Production
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
}

/**
 * Draw a rounded rectangle with smooth corners
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

/**
 * Wrap text into multiple lines based on maximum allowed width
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  const rawParagraphs = (text || '').split('\n');

  for (const paragraph of rawParagraphs) {
    if (paragraph.trim() === '') {
      lines.push('');
      continue;
    }

    const words = paragraph.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine === '' ? word : currentLine + ' ' + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine !== '') {
      lines.push(currentLine);
    }
  }

  return lines;
}

/**
 * Draw App Icon for Notifications
 */
function drawAppIcon(
  ctx: CanvasRenderingContext2D,
  appType: AppType,
  x: number,
  y: number,
  size: number
) {
  ctx.save();

  const iconRadius = size * 0.22;
  drawRoundedRect(ctx, x, y, size, size, iconRadius);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const innerRadius = (size * 0.76) / 2;

  if (appType === 'messenger') {
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, '#00B2FE');
    gradient.addColorStop(0.5, '#006AFF');
    gradient.addColorStop(1, '#006AFF');

    ctx.beginPath();
    ctx.arc(centerX, centerY - 1, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX - innerRadius * 0.55, centerY + innerRadius * 0.65);
    ctx.lineTo(centerX - innerRadius * 0.85, centerY + innerRadius * 1.05);
    ctx.lineTo(centerX - innerRadius * 0.15, centerY + innerRadius * 0.85);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(centerX - size * 0.16, centerY + size * 0.08);
    ctx.lineTo(centerX - size * 0.02, centerY - size * 0.14);
    ctx.lineTo(centerX + size * 0.04, centerY - size * 0.03);
    ctx.lineTo(centerX + size * 0.17, centerY - size * 0.14);
    ctx.lineTo(centerX + size * 0.03, centerY + size * 0.14);
    ctx.lineTo(centerX - size * 0.03, centerY + size * 0.03);
    ctx.closePath();
    ctx.fill();
  } else if (appType === 'facebook') {
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#1877F2';
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(size * 0.65)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('f', centerX + size * 0.04, centerY + size * 0.05);
  } else if (appType === 'instagram') {
    const igGrad = ctx.createLinearGradient(x, y + size, x + size, y);
    igGrad.addColorStop(0, '#FA7E1E');
    igGrad.addColorStop(0.5, '#D62976');
    igGrad.addColorStop(1, '#962FBF');

    drawRoundedRect(ctx, x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.8, size * 0.2);
    ctx.fillStyle = igGrad;
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = size * 0.06;
    drawRoundedRect(ctx, x + size * 0.22, y + size * 0.22, size * 0.56, size * 0.56, size * 0.14);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX + size * 0.17, centerY - size * 0.17, size * 0.04, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  } else if (appType === 'tiktok') {
    drawRoundedRect(ctx, x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.8, size * 0.18);
    ctx.fillStyle = '#000000';
    ctx.fill();

    ctx.fillStyle = '#25F4EE';
    ctx.font = `bold ${Math.round(size * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', centerX - 2, centerY - 1);

    ctx.fillStyle = '#FE2C55';
    ctx.fillText('♪', centerX + 2, centerY + 1);
  } else {
    drawRoundedRect(ctx, x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.8, size * 0.2);
    ctx.fillStyle = '#34C759';
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 2, size * 0.26, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(centerX - size * 0.15, centerY + size * 0.1);
    ctx.lineTo(centerX - size * 0.22, centerY + size * 0.24);
    ctx.lineTo(centerX - size * 0.04, centerY + size * 0.16);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw Messenger Bottom Bar
 */
function drawMessengerBottomBar(
  ctx: CanvasRenderingContext2D,
  width: number,
  bottomY: number
) {
  ctx.save();
  const barHeight = 110;
  const startY = bottomY - barHeight;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, startY, width, barHeight);

  const iconBlue = '#0084FF';
  const centerY = startY + barHeight / 2;

  // 1. Camera Icon
  let currentX = 52;
  ctx.fillStyle = iconBlue;
  drawRoundedRect(ctx, currentX, centerY - 18, 42, 34, 8);
  ctx.fill();
  drawRoundedRect(ctx, currentX + 11, centerY - 24, 20, 10, 3);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(currentX + 21, centerY - 1, 9, 0, Math.PI * 2);
  ctx.fill();

  // 2. Photo Gallery Icon
  currentX += 74;
  ctx.fillStyle = iconBlue;
  drawRoundedRect(ctx, currentX, centerY - 20, 42, 38, 8);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(currentX + 13, centerY - 10, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(currentX + 7, centerY + 10);
  ctx.lineTo(currentX + 21, centerY - 4);
  ctx.lineTo(currentX + 35, centerY + 10);
  ctx.closePath();
  ctx.fill();

  // 3. Microphone Icon
  currentX += 74;
  ctx.fillStyle = iconBlue;
  drawRoundedRect(ctx, currentX + 12, centerY - 22, 16, 26, 8);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = iconBlue;
  ctx.beginPath();
  ctx.arc(currentX + 20, centerY - 8, 14, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(currentX + 20, centerY + 6);
  ctx.lineTo(currentX + 20, centerY + 14);
  ctx.stroke();

  // 4. Like Icon
  const rightX = width - 52 - 40;
  ctx.fillStyle = iconBlue;
  ctx.beginPath();
  ctx.moveTo(rightX + 4, centerY + 16);
  ctx.lineTo(rightX + 14, centerY + 16);
  ctx.lineTo(rightX + 14, centerY - 6);
  ctx.lineTo(rightX + 4, centerY - 6);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(rightX + 18, centerY - 6);
  ctx.lineTo(rightX + 26, centerY - 22);
  ctx.lineTo(rightX + 32, centerY - 22);
  ctx.lineTo(rightX + 30, centerY - 8);
  ctx.lineTo(rightX + 42, centerY - 8);
  ctx.lineTo(rightX + 36, centerY + 16);
  ctx.lineTo(rightX + 18, centerY + 16);
  ctx.closePath();
  ctx.fill();

  // 5. Input Capsule
  const inputX = currentX + 64;
  const inputWidth = rightX - inputX - 24;
  const inputHeight = 62;
  const inputY = centerY - inputHeight / 2;

  ctx.fillStyle = '#242526';
  drawRoundedRect(ctx, inputX, inputY, inputWidth, inputHeight, inputHeight / 2);
  ctx.fill();

  ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.fillStyle = '#8e8e93';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Aa', inputX + 28, centerY);

  const smileX = inputX + inputWidth - 36;
  ctx.fillStyle = iconBlue;
  ctx.beginPath();
  ctx.arc(smileX, centerY, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#242526';
  ctx.beginPath();
  ctx.arc(smileX - 5, centerY - 4, 2, 0, Math.PI * 2);
  ctx.arc(smileX + 5, centerY - 4, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(smileX, centerY + 2, 8, 0.2, Math.PI - 0.2);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#242526';
  ctx.stroke();

  ctx.restore();
}

/**
 * 1. Render Direct Quote Canvas
 * Đặc biệt dành cho phôi Banner chính thức của Page Khoi Huk Jao (1080 x 862 px)
 * Viết chữ trực tiếp lên ảnh nền banner, dùng font Tiktok-Regular
 */
async function renderDirectQuoteCanvas(
  canvas: HTMLCanvasElement,
  config: CaptionConfig
): Promise<void> {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const canvasWidth = 1080;
  const canvasHeight = 862;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. Vẽ nền Banner chính thức của Khoi Huk Jao
  await drawCanvasBackground(ctx, canvasWidth, canvasHeight, config);

  // 2. Cấu hình Font chữ: Sử dụng Tiktok-Regular cho tiếng Lào
  const primaryFontFamily = config.brand === 'khoihukjao'
    ? `'Tiktok-Regular', 'Noto Sans Lao', sans-serif`
    : `'Noto Sans Lao', 'Inter', sans-serif`;

  // Lấy nội dung caption (từ quoteText hoặc notification đầu tiên)
  const text = (config.quoteText ?? config.notifications[0]?.caption ?? '').trim() ||
    'ບໍ່ແມ່ນຂ້ອຍຖືກເຂົາຫລີ້ນຂອງໃສ່ບໍ? ຄືມາຄິດຮອດເຂົາເຊົ້າແລງແທະ🫠';

  // Tính toán cỡ chữ tự động hoặc theo slider
  let fontSize = config.fontSize || 48;
  if (config.autoFontSize) {
    const len = text.length;
    if (len < 30) fontSize = 56;
    else if (len < 65) fontSize = 48;
    else if (len < 120) fontSize = 42;
    else if (len < 180) fontSize = 36;
    else fontSize = 30;
  }

  const lineSpacing = fontSize * 1.55;
  ctx.font = `normal ${fontSize}px ${primaryFontFamily}`;

  // Vùng an toàn trên phôi banner:
  // Banner 1080x862, tránh logo góc trên bên trái và watermark góc dưới bên phải
  const maxTextWidth = 840;
  const lines = wrapText(ctx, text, maxTextWidth);

  const totalTextHeight = lines.length * lineSpacing;
  const safeCenterY = 465;
  const startY = Math.max(180, Math.round(safeCenterY - totalTextHeight / 2));

  const align = config.quoteTextAlign || 'center';
  const textColor = config.quoteTextColor || '#111827';

  ctx.save();
  ctx.fillStyle = textColor;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';

  const textX = align === 'center' ? canvasWidth / 2 : 120;
  let currentY = startY + fontSize * 0.55;

  for (const line of lines) {
    ctx.fillText(line, textX, currentY);
    currentY += lineSpacing;
  }

  ctx.restore();
}

/**
 * 2. Render Chat Messages Canvas
 */
async function renderChatCanvas(
  canvas: HTMLCanvasElement,
  config: CaptionConfig
): Promise<void> {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const isKhoiHukJao = config.brand === 'khoihukjao';
  const canvasWidth = isKhoiHukJao ? 1080 : 1284;
  const paddingX = isKhoiHukJao ? 40 : 48;
  const maxBubbleWidth = isKhoiHukJao ? 760 : 880;
  const bubblePaddingX = isKhoiHukJao ? 32 : 36;
  const bubblePaddingY = isKhoiHukJao ? 20 : 22;

  const primaryFontFamily = isKhoiHukJao
    ? `'Tiktok-Regular', 'Noto Sans Lao', sans-serif`
    : `'Noto Sans Lao', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif`;

  const messages: ChatMessage[] = config.chatMessages && config.chatMessages.length > 0
    ? config.chatMessages
    : [
        { id: '1', side: 'left', text: 'ບໍ່ເປັນຫຍັງສ່ຽວເຮົາເປັນໝູ່ກັນ' },
        { id: '2', side: 'left', text: 'ກູກະຮັກມຶງຄືເກົ່າ' },
        { id: '3', side: 'right', text: 'ຄືເກົ່າຫັ້ນແຫລະສ່ຽວ' },
        { id: '4', side: 'right', text: 'ວ່າແຕ່ມີຈັກສອງແສນໃຫ້ຢືມບໍສ່ຽວ??' }
      ];

  const fontSize = config.fontSize || (isKhoiHukJao ? 34 : 38);
  const lineSpacing = fontSize * 1.42;
  ctx.font = `500 ${fontSize}px ${primaryFontFamily}`;

  interface ComputedBubble {
    message: ChatMessage;
    lines: string[];
    bubbleWidth: number;
    bubbleHeight: number;
    marginBottom: number;
  }

  const computedBubbles: ComputedBubble[] = [];
  let totalMessagesHeight = 0;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const lines = wrapText(ctx, msg.text || '...', maxBubbleWidth - bubblePaddingX * 2);

    let longestLineWidth = 0;
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      if (w > longestLineWidth) longestLineWidth = w;
    }

    const bubbleWidth = Math.max(120, Math.min(maxBubbleWidth, longestLineWidth + bubblePaddingX * 2));
    const bubbleHeight = Math.max(70, lines.length * lineSpacing + bubblePaddingY * 2 - 8);

    const isNextSameSide = i < messages.length - 1 && messages[i + 1].side === msg.side;
    const marginBottom = isNextSameSide ? 10 : 26;

    computedBubbles.push({
      message: msg,
      lines,
      bubbleWidth,
      bubbleHeight,
      marginBottom
    });

    totalMessagesHeight += bubbleHeight + marginBottom;
  }

  const bottomBarHeight = config.showBottomBar ? 120 : 0;

  let canvasHeight = isKhoiHukJao ? 862 : 900;
  if (!isKhoiHukJao) {
    if (config.aspectRatio === '1:1') {
      canvasHeight = 1284;
    } else if (config.aspectRatio === '16:9') {
      canvasHeight = Math.round((1284 * 9) / 16);
    } else {
      canvasHeight = Math.max(860, totalMessagesHeight + bottomBarHeight + 360);
    }
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. Draw Background
  await drawCanvasBackground(ctx, canvasWidth, canvasHeight, config);

  // 2. Center vertically
  const availableHeight = canvasHeight - bottomBarHeight;
  const startY = Math.max(50, Math.round((availableHeight - totalMessagesHeight) / 2));

  let currentY = startY;

  // 3. Render bubbles
  for (const item of computedBubbles) {
    const { message, lines, bubbleWidth, bubbleHeight, marginBottom } = item;
    const isRight = message.side === 'right';

    const bubbleX = isRight
      ? canvasWidth - paddingX - bubbleWidth
      : paddingX;
    const bubbleY = currentY;

    ctx.save();
    const bubbleRadius = 32;
    drawRoundedRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, bubbleRadius);

    if (isRight) {
      const blueGrad = ctx.createLinearGradient(
        bubbleX,
        bubbleY,
        bubbleX + bubbleWidth,
        bubbleY + bubbleHeight
      );
      blueGrad.addColorStop(0, '#0084FF');
      blueGrad.addColorStop(1, '#0070FF');
      ctx.fillStyle = blueGrad;
    } else {
      ctx.fillStyle = isKhoiHukJao ? '#1c1c1e' : (config.customBgUrl ? 'rgba(38, 38, 40, 0.94)' : '#262628');
    }
    ctx.fill();

    if ((config.customBgUrl || isKhoiHukJao) && !isRight) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.font = `500 ${fontSize}px ${primaryFontFamily}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    let textY = bubbleY + bubblePaddingY + fontSize * 0.55;
    for (let l = 0; l < lines.length; l++) {
      ctx.fillText(lines[l], bubbleX + bubblePaddingX, textY);
      textY += lineSpacing;
    }
    ctx.restore();

    currentY += bubbleHeight + marginBottom;
  }

  // 4. Draw Bottom Action Bar
  if (config.showBottomBar && !isKhoiHukJao) {
    drawMessengerBottomBar(ctx, canvasWidth, canvasHeight);
  }
}

/**
 * 3. Render Notification Cards Canvas (Single or Double)
 */
async function renderNotificationCanvas(
  canvas: HTMLCanvasElement,
  config: CaptionConfig
): Promise<void> {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const isKhoiHukJao = config.brand === 'khoihukjao';
  const canvasWidth = isKhoiHukJao ? 1080 : 1284;
  const cardMarginX = isKhoiHukJao ? 48 : 52;
  const cardWidth = canvasWidth - cardMarginX * 2;
  const cardPaddingX = isKhoiHukJao ? 36 : 40;
  const cardPaddingY = isKhoiHukJao ? 32 : 36;
  const iconSize = isKhoiHukJao ? 84 : 92;
  const gapBetweenIconAndText = 24;
  const gapBetweenCards = 22;

  const contentX = cardMarginX + cardPaddingX + iconSize + gapBetweenIconAndText;
  const maxContentWidth = cardMarginX + cardWidth - cardPaddingX - contentX;

  const primaryFontFamily = isKhoiHukJao
    ? `'Tiktok-Regular', 'Noto Sans Lao', sans-serif`
    : `'Noto Sans Lao', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif`;

  const activeNotifications: NotificationItem[] =
    config.mode === 'double'
      ? config.notifications.slice(0, 2)
      : config.notifications.slice(0, 1);

  const titleFontSize = isKhoiHukJao ? 30 : 34;
  const timeFontSize = isKhoiHukJao ? 24 : 28;
  const headerHeight = 36;
  const gapHeaderToBody = 18;

  interface CardComputed {
    notification: NotificationItem;
    lines: string[];
    fontSize: number;
    lineSpacing: number;
    cardHeight: number;
  }

  const computedCards: CardComputed[] = activeNotifications.map((notif) => {
    let bodyFontSize = config.fontSize || (isKhoiHukJao ? 34 : 38);
    if (config.autoFontSize) {
      const textLen = (notif.caption || '').length;
      if (textLen < 35) {
        bodyFontSize = config.mode === 'double' ? 36 : 38;
      } else if (textLen < 85) {
        bodyFontSize = config.mode === 'double' ? 32 : 34;
      } else if (textLen < 150) {
        bodyFontSize = 30;
      } else {
        bodyFontSize = 26;
      }
    }

    ctx.font = `500 ${bodyFontSize}px ${primaryFontFamily}`;
    const lines = wrapText(ctx, notif.caption || '...', maxContentWidth);
    const lineSpacing = bodyFontSize * 1.42;

    const bodyTextHeight = Math.max(1, lines.length) * lineSpacing;
    const totalContentHeight = headerHeight + gapHeaderToBody + bodyTextHeight;
    const minCardHeight = iconSize + cardPaddingY * 2;
    const cardHeight = Math.max(minCardHeight, totalContentHeight + cardPaddingY * 2);

    return {
      notification: notif,
      lines,
      fontSize: bodyFontSize,
      lineSpacing,
      cardHeight,
    };
  });

  const totalCardsHeight =
    computedCards.reduce((acc, c) => acc + c.cardHeight, 0) +
    gapBetweenCards * Math.max(0, computedCards.length - 1);

  let canvasHeight = isKhoiHukJao ? 862 : 900;
  if (!isKhoiHukJao) {
    if (config.aspectRatio === '1:1') {
      canvasHeight = 1284;
    } else if (config.aspectRatio === '16:9') {
      canvasHeight = Math.round((1284 * 9) / 16);
    } else {
      const baseHeight = config.mode === 'double' ? 960 : 860;
      canvasHeight = Math.max(baseHeight, totalCardsHeight + (config.mode === 'double' ? 440 : 640));
    }
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. Draw Background
  await drawCanvasBackground(ctx, canvasWidth, canvasHeight, config);

  let currentCardY = Math.round((canvasHeight - totalCardsHeight) / 2);

  for (const card of computedCards) {
    const cardX = cardMarginX;
    const cardY = currentCardY;
    const { notification: notif, lines, fontSize, lineSpacing, cardHeight } = card;

    // Card Background
    ctx.save();
    const cardRadius = 46;
    drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, cardRadius);

    if (isKhoiHukJao) {
      ctx.fillStyle = config.cardTheme === 'pitchBlack' ? '#111113' : 'rgba(28, 28, 30, 0.94)';
    } else if (config.cardTheme === 'glass' || config.customBgUrl) {
      ctx.fillStyle = 'rgba(28, 28, 30, 0.88)';
    } else if (config.cardTheme === 'pitchBlack') {
      ctx.fillStyle = '#141415';
    } else {
      ctx.fillStyle = '#1c1c1e';
    }
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // App Icon
    const iconX = cardX + cardPaddingX;
    const iconY = cardY + cardPaddingY;
    drawAppIcon(ctx, notif.appType || 'messenger', iconX, iconY, iconSize);

    // Header
    const headerY = iconY + titleFontSize * 0.72;

    ctx.save();
    ctx.font = `700 ${titleFontSize}px ${primaryFontFamily}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const displayTitle = notif.pageTitle || (isKhoiHukJao ? 'Khoi Huk Jao' : 'Khamko Production');
    ctx.fillText(displayTitle, contentX, headerY);

    ctx.font = `400 ${timeFontSize}px ${primaryFontFamily}`;
    ctx.fillStyle = '#8e8e93';
    ctx.textAlign = 'right';
    const timeX = cardX + cardWidth - cardPaddingX;
    ctx.fillText(notif.timestamp || 'now', timeX, headerY);
    ctx.restore();

    // Body
    ctx.save();
    ctx.font = `500 ${fontSize}px ${primaryFontFamily}`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    let currentLineY = headerY + gapHeaderToBody + fontSize;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      ctx.fillText(line, contentX, currentLineY);
      currentLineY += lineSpacing;
    }
    ctx.restore();

    currentCardY += cardHeight + gapBetweenCards;
  }
}

/**
 * Main Render Engine entrypoint
 */
export async function renderCaptionCanvas(
  canvas: HTMLCanvasElement,
  config: CaptionConfig
): Promise<void> {
  await ensureFontsLoaded(config.brand);

  if (config.templateType === 'directQuote') {
    await renderDirectQuoteCanvas(canvas, config);
  } else if (config.templateType === 'chat') {
    await renderChatCanvas(canvas, config);
  } else {
    await renderNotificationCanvas(canvas, config);
  }
}

/**
 * Export canvas to Data URL
 */
export function exportCanvasAsImage(
  canvas: HTMLCanvasElement,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  quality: number = 0.95
): string {
  return canvas.toDataURL(format, quality);
}

/**
 * Copy canvas image to clipboard
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        resolve(true);
      } catch (err) {
        console.error('Failed to copy to clipboard', err);
        resolve(false);
      }
    }, 'image/png');
  });
}

export interface BatchProgressCallback {
  (current: number, total: number, currentCaption: string): void;
}

export interface GeneratedBatchItem {
  id: string;
  filename: string;
  caption: string;
  blob: Blob;
  dataUrl: string;
}

/**
 * Generate multiple caption images in memory and package into a ZIP file
 */
export async function generateBatchImages(
  captions: string[],
  baseConfig: CaptionConfig,
  onProgress?: BatchProgressCallback
): Promise<{ zipBlob: Blob; items: GeneratedBatchItem[] }> {
  await ensureFontsLoaded(baseConfig.brand);

  const zip = new JSZip();
  const offscreenCanvas = document.createElement('canvas');
  const items: GeneratedBatchItem[] = [];

  const validCaptions = captions.map((c) => c.trim()).filter((c) => c.length > 0);
  const total = validCaptions.length;

  for (let i = 0; i < total; i++) {
    const caption = validCaptions[i];

    if (onProgress) {
      onProgress(i + 1, total, caption);
    }

    // Build specific config for this caption item
    const itemConfig: CaptionConfig = {
      ...baseConfig,
      quoteText: caption,
      notifications: baseConfig.notifications.map((item, idx) =>
        idx === 0 ? { ...item, caption } : item
      ),
    };

    // Render on offscreen canvas
    await renderCaptionCanvas(offscreenCanvas, itemConfig);

    // Convert to PNG blob & dataUrl
    const blob = await new Promise<Blob | null>((resolve) =>
      offscreenCanvas.toBlob(resolve, 'image/png', 0.95)
    );

    const dataUrl = offscreenCanvas.toDataURL('image/png', 0.95);

    if (blob) {
      const prefix = baseConfig.brand === 'khoihukjao' ? 'khoihukjao' : 'khamko';
      const cleanSlug = caption
        .slice(0, 20)
        .replace(/[^a-zA-Z0-9\u0E80-\u0EFF\u00C0-\u1EF9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || 'meme';
      const filename = `${String(i + 1).padStart(2, '0')}_${prefix}_${cleanSlug}.png`;

      zip.file(filename, blob);
      items.push({
        id: `batch-item-${i + 1}`,
        filename,
        caption,
        blob,
        dataUrl,
      });
    }
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return { zipBlob, items };
}

/**
 * Trigger browser file download from Blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

