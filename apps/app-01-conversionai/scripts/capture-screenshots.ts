import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ScreenshotConfig {
  input: string;
  output: string;
  width: number;
  height: number;
}

const screenshots: ScreenshotConfig[] = [
  // App Icon (1200x1200)
  {
    input: "app-icon.html",
    output: "../docs/app-icon.png",
    width: 1200,
    height: 1200,
  },
  // Feature Media (1600x900)
  {
    input: "feature-media.html",
    output: "../docs/feature-media.png",
    width: 1600,
    height: 900,
  },
  // Desktop Screenshots (1600x900)
  {
    input: "screenshots/desktop-1-dashboard.html",
    output: "../docs/desktop-screenshot-1.png",
    width: 1600,
    height: 900,
  },
  {
    input: "screenshots/desktop-2-analysis.html",
    output: "../docs/desktop-screenshot-2.png",
    width: 1600,
    height: 900,
  },
  {
    input: "screenshots/desktop-3-recommendation.html",
    output: "../docs/desktop-screenshot-3.png",
    width: 1600,
    height: 900,
  },
  {
    input: "screenshots/desktop-4-code.html",
    output: "../docs/desktop-screenshot-4.png",
    width: 1600,
    height: 900,
  },
  // Mobile Screenshots (1600x900)
  {
    input: "screenshots/mobile-1-dashboard.html",
    output: "../docs/mobile-screenshot-1.png",
    width: 1600,
    height: 900,
  },
  {
    input: "screenshots/mobile-2-recommendation.html",
    output: "../docs/mobile-screenshot-2.png",
    width: 1600,
    height: 900,
  },
];

async function captureScreenshots() {
  console.log("Starting screenshot capture...\n");

  const browser = await chromium.launch();

  for (const config of screenshots) {
    const inputPath = path.resolve(__dirname, config.input);
    const outputPath = path.resolve(__dirname, config.output);

    console.log(`Capturing: ${config.input}`);
    console.log(`  Size: ${config.width}x${config.height}`);

    const page = await browser.newPage({
      viewport: { width: config.width, height: config.height },
    });

    await page.goto(`file://${inputPath}`, { waitUntil: "networkidle" });

    // Wait for fonts to load
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: outputPath,
      type: "png",
    });

    console.log(`  Saved: ${config.output}\n`);

    await page.close();
  }

  await browser.close();

  console.log("All screenshots captured successfully!");
  console.log("\nOutput files:");
  for (const config of screenshots) {
    console.log(`  - docs/${path.basename(config.output)}`);
  }
}

captureScreenshots().catch(console.error);
