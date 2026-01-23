const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Shopify mobile screenshot dimensions (same as desktop per requirements)
const MOBILE_WIDTH = 1600;
const MOBILE_HEIGHT = 900;

// Phone mockup dimensions (landscape orientation)
const PHONE_PADDING = 30;
const PHONE_RADIUS = 35;
const NOTCH_WIDTH = 120;
const NOTCH_HEIGHT = 25;

const inputDir = path.join(__dirname, '../docs/screenshots-branded');
const mobileOutputDir = path.join(__dirname, '../docs/screenshots-mobile');

if (!fs.existsSync(mobileOutputDir)) {
  fs.mkdirSync(mobileOutputDir, { recursive: true });
}

const screenshots = [
  { file: '01-dashboard.png', title: 'Dashboard' },
  { file: '02-recommendations-list.png', title: 'Recommendations' },
  { file: '03-recommendation-modal.png', title: 'Details' },
  { file: '04-upgrade-billing.png', title: 'Upgrade' },
  { file: '05-analysis-start.png', title: 'Analysis' },
  { file: '06-settings.png', title: 'Settings' }
];

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function createMobileMockup(inputPath, outputPath, title) {
  const image = await loadImage(inputPath);
  const canvas = createCanvas(MOBILE_WIDTH, MOBILE_HEIGHT);
  const ctx = canvas.getContext('2d');

  // Gradient background (brand colors)
  const gradient = ctx.createLinearGradient(0, 0, MOBILE_WIDTH, MOBILE_HEIGHT);
  gradient.addColorStop(0, '#2563EB');
  gradient.addColorStop(1, '#7C3AED');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, MOBILE_WIDTH, MOBILE_HEIGHT);

  // Landscape phone frame - centered with margins for title
  const phoneWidth = 1100;
  const phoneHeight = 700;
  const phoneX = (MOBILE_WIDTH - phoneWidth) / 2;
  const phoneY = 140;

  // Phone shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 15;

  // Phone body (landscape)
  ctx.fillStyle = '#1a1a1a';
  roundRect(ctx, phoneX, phoneY, phoneWidth, phoneHeight, PHONE_RADIUS);
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Phone screen area
  const screenPadding = 10;
  const screenX = phoneX + screenPadding;
  const screenY = phoneY + screenPadding;
  const screenWidth = phoneWidth - (screenPadding * 2);
  const screenHeight = phoneHeight - (screenPadding * 2);

  // Clip to rounded screen
  ctx.save();
  roundRect(ctx, screenX, screenY, screenWidth, screenHeight, PHONE_RADIUS - screenPadding);
  ctx.clip();

  // Draw screenshot (crop center, fit to screen)
  const sourceAspect = image.width / image.height;
  const targetAspect = screenWidth / screenHeight;

  let sx, sy, sw, sh;
  if (sourceAspect > targetAspect) {
    // Source is wider, crop sides
    sh = image.height;
    sw = image.height * targetAspect;
    sx = (image.width - sw) / 2;
    sy = 0;
  } else {
    // Source is taller, crop top/bottom
    sw = image.width;
    sh = image.width / targetAspect;
    sx = 0;
    sy = (image.height - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, screenX, screenY, screenWidth, screenHeight);
  ctx.restore();

  // Notch on left side (landscape orientation)
  ctx.fillStyle = '#1a1a1a';
  const notchY = phoneY + (phoneHeight - NOTCH_WIDTH) / 2;
  roundRect(ctx, phoneX - 5, notchY, NOTCH_HEIGHT, NOTCH_WIDTH, 10);
  ctx.fill();

  // Title at top
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 52px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, MOBILE_WIDTH / 2, 80);

  // Brand text at bottom
  ctx.font = '28px Arial, Helvetica, sans-serif';
  ctx.globalAlpha = 0.9;
  ctx.fillText('ConversionAI by ApexMind', MOBILE_WIDTH / 2, MOBILE_HEIGHT - 30);
  ctx.globalAlpha = 1;

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  return buffer.length;
}

async function main() {
  console.log('Creating mobile mockups...\n');

  for (const screenshot of screenshots) {
    const inputPath = path.join(inputDir, screenshot.file);
    const outputPath = path.join(mobileOutputDir, screenshot.file);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${screenshot.file} (not found)`);
      continue;
    }

    const size = await createMobileMockup(inputPath, outputPath, screenshot.title);
    console.log(`✅ ${screenshot.file} - ${(size / 1024).toFixed(1)} KB`);
  }

  console.log('\nDone! Mobile mockups saved to:', mobileOutputDir);
}

main().catch(console.error);
