import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function captureFeatureMedia() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set exact viewport
  await page.setViewportSize({ width: 1600, height: 900 });

  // Load the HTML file
  const htmlPath = path.join(__dirname, 'feature-media.html');
  await page.goto(`file://${htmlPath}`);

  // Wait for fonts to load
  await page.waitForTimeout(2000);

  // Capture screenshot
  const outputPath = path.join(__dirname, '..', 'docs', 'conversionai-feature-media.png');

  // Ensure docs directory exists
  const docsDir = path.dirname(outputPath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  await page.screenshot({
    path: outputPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1600, height: 900 }
  });

  console.log(`✅ Feature media saved to: ${outputPath}`);

  await browser.close();
}

captureFeatureMedia().catch(console.error);
