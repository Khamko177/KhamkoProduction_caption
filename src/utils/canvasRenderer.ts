import {
  CaptionConfig,
  AppType,
  NotificationItem,
  ChatMessage
} from '../types';

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
 * Draw Messenger Bottom Bar (Camera, Gallery, Mic, Aa Input, Like button)
 */
function drawMessengerBottomBar(
  ctx: CanvasRenderingContext2D,
  width: number,
  bottomY: number
) {
  ctx.save();
  const barHeight = 110;
  const startY = bottomY - barHeight;

  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, startY, width, barHeight);

  const iconBlue = '#0084FF';
  const iconSize = 44;
  const centerY = startY + barHeight / 2;

  // 1. Camera Icon (left 50px)
  let currentX = 52;
  ctx.fillStyle = iconBlue;
  // Camera body
  drawRoundedRect(ctx, currentX, centerY - 18, 42, 34, 8);
  ctx.fill();
  // Camera top bump
  drawRoundedRect(ctx, currentX + 11, centerY - 24, 20, 10, 3);
  ctx.fill();
  // Lens
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(currentX + 21, centerY - 1, 9, 0, Math.PI * 2);
  ctx.fill();

  // 2. Photo Gallery Icon (left ~126px)
  currentX += 74;
  ctx.fillStyle = iconBlue;
  drawRoundedRect(ctx, currentX, centerY - 20, 42, 38, 8);
  ctx.fill();
  // Mountain/Sun in gallery
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

  // 3. Microphone Icon (left ~200px)
  currentX += 74;
  ctx.fillStyle = iconBlue;
  // Mic head
  drawRoundedRect(ctx, currentX + 12, centerY - 22, 16, 26, 8);
  ctx.fill();
  // Mic holder
  ctx.lineWidth = 4;
  ctx.strokeStyle = iconBlue;
  ctx.beginPath();
  ctx.arc(currentX + 20, centerY - 8, 14, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(currentX + 20, centerY + 6);
  ctx.lineTo(currentX + 20, centerY + 14);
  ctx.stroke();

  // 4. Like (Thumbs up) Icon on far right
  const rightX = width - 52 - 40;
  ctx.fillStyle = iconBlue;
  // Thumbs up vector shape
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

  // 5. Middle Input Capsule ("Aa" + Smile emoji)
  const inputX = currentX + 64;
  const inputWidth = rightX - inputX - 24;
  const inputHeight = 62;
  const inputY = centerY - inputHeight / 2;

  ctx.fillStyle = '#242526';
  drawRoundedRect(ctx, inputX, inputY, inputWidth, inputHeight, inputHeight / 2);
  ctx.fill();

  // Placeholder "Aa"
  ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.fillStyle = '#8e8e93';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Aa', inputX + 28, centerY);

  // Smile emoji inside capsule on right
  const smileX = inputX + inputWidth - 36;
  ctx.fillStyle = iconBlue;
  ctx.beginPath();
  ctx.arc(smileX, centerY, 16, 0, Math.PI * 2);
  ctx.fill();
  // Eyes & mouth
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
 * Render Chat Messages Canvas
 */
async function renderChatCanvas(
  canvas: HTMLCanvasElement,
  config: CaptionConfig
): Promise<void> {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const canvasWidth = 1284;
  const paddingX = 48;
  const maxBubbleWidth = 880;
  const bubblePaddingX = 36;
  const bubblePaddingY = 22;
  const primaryFontFamily = `'Noto Sans Lao', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif`;

  const messages: ChatMessage[] = config.chatMessages && config.chatMessages.length > 0
    ? config.chatMessages
    : [
        { id: '1', side: 'left', text: 'ບໍ່ເປັນຫຍັງສ່ຽວເຮົາເປັນໝູ່ກັນ' },
        { id: '2', side: 'left', text: 'ກູກະຮັກມຶງຄືເກົ່າ' },
        { id: '3', side: 'right', text: 'ຄືເກົ່າຫັ້ນແຫລະສ່ຽວ' },
        { id: '4', side: 'right', text: 'ວ່າແຕ່ມີຈັກສອງແສນໃຫ້ຢືມບໍສ່ຽວ??' }
      ];

  const fontSize = config.fontSize || 38;
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
    
    // Calculate width
    let longestLineWidth = 0;
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      if (w > longestLineWidth) longestLineWidth = w;
    }

    const bubbleWidth = Math.max(120, Math.min(maxBubbleWidth, longestLineWidth + bubblePaddingX * 2));
    const bubbleHeight = Math.max(76, lines.length * lineSpacing + bubblePaddingY * 2 - 8);

    const isNextSameSide = i < messages.length - 1 && messages[i + 1].side === msg.side;
    const marginBottom = isNextSameSide ? 10 : 28;

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
  
  // Calculate canvas height
  let canvasHeight = 900;
  if (config.aspectRatio === '1:1') {
    canvasHeight = 1284;
  } else if (config.aspectRatio === '16:9') {
    canvasHeight = Math.round((1284 * 9) / 16);
  } else {
    canvasHeight = Math.max(860, totalMessagesHeight + bottomBarHeight + 360);
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. Solid Black Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Calculate vertical starting point
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

    // Draw Bubble
    ctx.save();
    const bubbleRadius = 34;
    drawRoundedRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, bubbleRadius);

    if (isRight) {
      // Messenger Blue gradient
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
      // Messenger Left Grey
      ctx.fillStyle = '#262628';
    }
    ctx.fill();

    // Draw text inside
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

  // 4. Draw Bottom Action Bar if enabled
  if (config.showBottomBar) {
    drawMessengerBottomBar(ctx, canvasWidth, canvasHeight);
  }
}

/**
 * Render Notification Cards Canvas (Single or Double)
 */
async function renderNotificationCanvas(
  canvas: HTMLCanvasElement,
  config: CaptionConfig
): Promise<void> {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const canvasWidth = 1284;
  const cardMarginX = 52;
  const cardWidth = canvasWidth - cardMarginX * 2; // 1180px
  const cardPaddingX = 40;
  const cardPaddingY = 36;
  const iconSize = 92;
  const gapBetweenIconAndText = 24;
  const gapBetweenCards = 22;

  const contentX = cardMarginX + cardPaddingX + iconSize + gapBetweenIconAndText;
  const maxContentWidth = cardMarginX + cardWidth - cardPaddingX - contentX;

  const primaryFontFamily = `'Noto Sans Lao', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif`;

  const activeNotifications: NotificationItem[] =
    config.mode === 'double'
      ? config.notifications.slice(0, 2)
      : config.notifications.slice(0, 1);

  const titleFontSize = 34;
  const timeFontSize = 28;
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
    let bodyFontSize = config.fontSize || 38;
    if (config.autoFontSize) {
      const textLen = (notif.caption || '').length;
      if (textLen < 35) {
        bodyFontSize = config.mode === 'double' ? 38 : 40;
      } else if (textLen < 85) {
        bodyFontSize = config.mode === 'double' ? 36 : 38;
      } else if (textLen < 150) {
        bodyFontSize = 32;
      } else {
        bodyFontSize = 28;
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

  let canvasHeight = 900;
  if (config.aspectRatio === '1:1') {
    canvasHeight = 1284;
  } else if (config.aspectRatio === '16:9') {
    canvasHeight = Math.round((1284 * 9) / 16);
  } else {
    const baseHeight = config.mode === 'double' ? 960 : 860;
    canvasHeight = Math.max(baseHeight, totalCardsHeight + (config.mode === 'double' ? 440 : 640));
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Solid Black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  let currentCardY = Math.round((canvasHeight - totalCardsHeight) / 2);

  for (const card of computedCards) {
    const cardX = cardMarginX;
    const cardY = currentCardY;
    const { notification: notif, lines, fontSize, lineSpacing, cardHeight } = card;

    // Card Background
    ctx.save();
    const cardRadius = 50;
    drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, cardRadius);

    if (config.cardTheme === 'glass') {
      ctx.fillStyle = 'rgba(32, 33, 36, 0.92)';
    } else if (config.cardTheme === 'pitchBlack') {
      ctx.fillStyle = '#141415';
    } else {
      ctx.fillStyle = '#1c1c1e';
    }
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
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
    ctx.fillText(notif.pageTitle || 'Khamko Production', contentX, headerY);

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
  try {
    await document.fonts.ready;
  } catch (e) {}

  if (config.templateType === 'chat') {
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
