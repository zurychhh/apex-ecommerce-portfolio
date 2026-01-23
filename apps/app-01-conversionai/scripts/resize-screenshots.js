const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Dimensions
const DESKTOP_WIDTH = 1600;
const DESKTOP_HEIGHT = 900;
const MOBILE_WIDTH = 900;
const MOBILE_HEIGHT = 1600;

const inputDir = path.join(__dirname, '../docs/screenshots-branded');
const desktopOutputDir = path.join(__dirname, '../docs/screenshots-desktop');
const mobileOutputDir = path.join(__dirname, '../docs/screenshots-mobile');

// Create output directories
if (!fs.existsSync(desktopOutputDir)) {
  fs.mkdirSync(desktopOutputDir, { recursive: true });
}
if (!fs.existsSync(mobileOutputDir)) {
  fs.mkdirSync(mobileOutputDir, { recursive: true });
}

const screenshots = [
  '01-dashboard.png',
  '02-recommendations-list.png',
  '03-recommendation-modal.png',
  '04-upgrade-billing.png',
  '05-analysis-start.png',
  '06-settings.png'
];

async function resizeImage(inputPath, outputPath, targetWidth, targetHeight, isMobile = false) {
  const image = await loadImage(inputPath);
  const canvas = createCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');

  // Fill background (in case aspect ratio differs)
  ctx.fillStyle = '#F6F6F7'; // Shopify admin background color
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  if (isMobile) {
    // For mobile: crop center portion and resize to fit mobile aspect ratio
    // Take a narrower slice from the center of the original image
    const sourceWidth = image.height * (MOBILE_WIDTH / MOBILE_HEIGHT);
    const sourceX = (image.width - sourceWidth) / 2;

    ctx.drawImage(
      image,
      sourceX, 0, sourceWidth, image.height, // Source rectangle
      0, 0, targetWidth, targetHeight // Destination rectangle
    );
  } else {
    // For desktop: resize to fit width, center vertically if needed
    const scale = targetWidth / image.width;
    const scaledHeight = image.height * scale;

    if (scaledHeight >= targetHeight) {
      // Image is taller than target, crop top/bottom
      const sourceHeight = image.width * (targetHeight / targetWidth);
      const sourceY = (image.height - sourceHeight) / 2;
      ctx.drawImage(
        image,
        0, sourceY, image.width, sourceHeight,
        0, 0, targetWidth, targetHeight
      );
    } else {
      // Image is shorter than target, fit to width and center
      const yOffset = (targetHeight - scaledHeight) / 2;
      ctx.drawImage(image, 0, yOffset, targetWidth, scaledHeight);
    }
  }

  // Add subtle branded frame for mobile
  if (isMobile) {
    // Add device frame effect
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2;
    ctx.roundRect(10, 10, targetWidth - 20, targetHeight - 20, 20);
    ctx.stroke();

    // Status bar area
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(0, 0, targetWidth, 44);

    // Status bar text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ConversionAI', targetWidth / 2, 28);
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  return { width: targetWidth, height: targetHeight, size: buffer.length };
}

async function main() {
  console.log('Resizing screenshots...\n');

  for (const screenshot of screenshots) {
    const inputPath = path.join(inputDir, screenshot);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${screenshot} (not found)`);
      continue;
    }

    // Desktop version
    const desktopOutput = path.join(desktopOutputDir, screenshot);
    const desktopResult = await resizeImage(inputPath, desktopOutput, DESKTOP_WIDTH, DESKTOP_HEIGHT, false);
    console.log(`✅ Desktop: ${screenshot}`);
    console.log(`   Size: ${DESKTOP_WIDTH}x${DESKTOP_HEIGHT}, ${(desktopResult.size / 1024).toFixed(1)} KB`);

    // Mobile version
    const mobileOutput = path.join(mobileOutputDir, screenshot);
    const mobileResult = await resizeImage(inputPath, mobileOutput, MOBILE_WIDTH, MOBILE_HEIGHT, true);
    console.log(`✅ Mobile:  ${screenshot}`);
    console.log(`   Size: ${MOBILE_WIDTH}x${MOBILE_HEIGHT}, ${(mobileResult.size / 1024).toFixed(1)} KB`);
    console.log('');
  }

  console.log('Done! Screenshots saved to:');
  console.log(`  Desktop: ${desktopOutputDir}`);
  console.log(`  Mobile:  ${mobileOutputDir}`);
}

main().catch(console.error);
