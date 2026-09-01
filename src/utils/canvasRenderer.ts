import { CaptionConfig, AppType } from '../types';

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
 * Draw App Icon (Messenger, Facebook, Instagram, TikTok, Messages)
 */
function drawAppIcon(
  ctx: CanvasRenderingContext2D,
  appType: AppType,
  x: number,
  y: number,
  size: number
) {
  ctx.save();

  // White squircle container
  const iconRadius = size * 0.22;
  drawRoundedRect(ctx, x, y, size, size, iconRadius);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const innerRadius = (size * 0.76) / 2;

  if (appType === 'messenger') {
    // Messenger circular blue bubble with lightning
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, '#00B2FE');
    gradient.addColorStop(0.5, '#006AFF');
    gradient.addColorStop(1, '#006AFF');

    ctx.beginPath();
    ctx.arc(centerX, centerY - 1, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Messenger tail
    ctx.beginPath();
    ctx.moveTo(centerX - innerRadius * 0.55, centerY + innerRadius * 0.65);
    ctx.lineTo(centerX - innerRadius * 0.85, centerY + innerRadius * 1.05);
    ctx.lineTo(centerX - innerRadius * 0.15, centerY + innerRadius * 0.85);
    ctx.fillStyle = gradient;
    ctx.fill();

    // White lightning bolt
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
 * Main Render Engine to draw the Meme/Caption Image
 */
export async function renderCaptionCanvas(
  canvas: HTMLCanvasElement,
  config: CaptionConfig
): Promise<void> {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  try {
    await document.fonts.ready;
  } catch (e) {
    // font ready fallback
  }

  const canvasWidth = 1284;
  const cardMarginX = 52;
  const cardWidth = canvasWidth - cardMarginX * 2; // 1180px
  const cardPaddingX = 40;
  const cardPaddingY = 38;
  const iconSize = 92;
  const gapBetweenIconAndText = 24;

  const contentX = cardMarginX + cardPaddingX + iconSize + gapBetweenIconAndText;
  const maxContentWidth = cardMarginX + cardWidth - cardPaddingX - contentX;

  const primaryFontFamily = `'Noto Sans Lao', 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif`;

  let bodyFontSize = config.fontSize || 38;
  if (config.autoFontSize) {
    const textLen = (config.caption || '').length;
    if (textLen < 35) {
      bodyFontSize = 40;
    } else if (textLen < 85) {
      bodyFontSize = 38;
    } else if (textLen < 150) {
      bodyFontSize = 34;
    } else {
      bodyFontSize = 30;
    }
  }

  ctx.font = `500 ${bodyFontSize}px ${primaryFontFamily}`;
  const lines = wrapText(ctx, config.caption || '...', maxContentWidth);
  const lineSpacing = bodyFontSize * 1.42;

  const titleFontSize = 34;
  const timeFontSize = 28;
  const headerHeight = 36;
  const gapHeaderToBody = 18;

  const bodyTextHeight = Math.max(1, lines.length) * lineSpacing;
  const totalContentHeight = headerHeight + gapHeaderToBody + bodyTextHeight;
  const minCardHeight = iconSize + cardPaddingY * 2;
  const cardHeight = Math.max(minCardHeight, totalContentHeight + cardPaddingY * 2);

  let canvasHeight = 900;
  if (config.aspectRatio === '1:1') {
    canvasHeight = 1284;
  } else if (config.aspectRatio === '16:9') {
    canvasHeight = Math.round((1284 * 9) / 16);
  } else {
    canvasHeight = Math.max(860, cardHeight + 650);
    if (canvasHeight < 860) canvasHeight = 860;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. Solid Black Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Card Position
  const cardX = cardMarginX;
  const cardY = Math.round((canvasHeight - cardHeight) / 2);

  // 3. Card Background
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

  // 4. App Icon
  const iconX = cardX + cardPaddingX;
  const iconY = cardY + cardPaddingY;
  drawAppIcon(ctx, config.appType || 'messenger', iconX, iconY, iconSize);

  // 5. Header: Title & Timestamp
  const headerY = iconY + titleFontSize * 0.72;

  ctx.save();
  ctx.font = `700 ${titleFontSize}px ${primaryFontFamily}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(config.pageTitle || 'Khamko Production', contentX, headerY);

  ctx.font = `400 ${timeFontSize}px ${primaryFontFamily}`;
  ctx.fillStyle = '#8e8e93';
  ctx.textAlign = 'right';
  const timeX = cardX + cardWidth - cardPaddingX;
  ctx.fillText(config.timestamp || 'now', timeX, headerY);
  ctx.restore();

  // 6. Body Text
  ctx.save();
  ctx.font = `500 ${bodyFontSize}px ${primaryFontFamily}`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  let currentLineY = headerY + gapHeaderToBody + bodyFontSize;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    ctx.fillText(line, contentX, currentLineY);
    currentLineY += lineSpacing;
  }
  ctx.restore();
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
