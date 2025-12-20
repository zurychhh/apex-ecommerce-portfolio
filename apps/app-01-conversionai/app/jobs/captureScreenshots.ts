/**
 * Screenshot capture using Playwright
 * Captures key pages of the Shopify store for Claude Vision API analysis
 */

import { chromium } from 'playwright';
import { logger } from '../utils/logger.server';

export interface Screenshot {
  url: string;
  path: string;
  base64?: string;
}

/**
 * Capture screenshots of specified URLs
 * Returns array of screenshot data
 */
export async function captureScreenshots(
  domain: string,
  paths: string[],
  options: { retries?: number; delayMs?: number } = {}
): Promise<Screenshot[]> {
  const { retries = 2, delayMs = 2000 } = options;

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // For Railway/Docker compatibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    // Typical browser settings to avoid detection
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });

  const screenshots: Screenshot[] = [];

  try {
    for (const path of paths) {
      const url = `https://${domain}${path}`;
      logger.info(`Capturing screenshot: ${url}`);

      let success = false;
      let attempts = 0;

      while (!success && attempts <= retries) {
        attempts++;

        const page = await context.newPage();

        try {
          // Block unnecessary resources for faster loading
          await page.route('**/*', (route) => {
            const resourceType = route.request().resourceType();
            if (['font', 'media'].includes(resourceType)) {
              route.abort();
            } else {
              route.continue();
            }
          });

          // Navigate to page
          await page.goto(url, {
            waitUntil: 'domcontentloaded', // Faster than networkidle
            timeout: 30000,
          });

          // Wait for images to load
          await page.evaluate(() => {
            return Promise.all(
              Array.from(document.images)
                .filter(img => !img.complete)
                .map(img => new Promise((resolve) => {
                  img.onload = img.onerror = resolve;
                }))
            );
          });

          // Additional wait for dynamic content
          await page.waitForTimeout(delayMs);

          // Try to dismiss common cookie/consent banners (best effort)
          try {
            const cookieSelectors = [
              'button:has-text("Accept")',
              'button:has-text("I agree")',
              'button:has-text("OK")',
              '[aria-label*="cookie" i] button',
              '[id*="cookie" i] button',
            ];

            for (const selector of cookieSelectors) {
              const button = page.locator(selector).first();
              if (await button.isVisible({ timeout: 1000 })) {
                await button.click({ timeout: 1000 });
                await page.waitForTimeout(500);
                break;
              }
            }
          } catch {
            // Ignore cookie banner dismissal errors
          }

          // Capture screenshot
          const screenshotBuffer = await page.screenshot({
            fullPage: false, // Only capture above-the-fold for faster processing
            type: 'png',
            animations: 'disabled', // Disable animations for consistent screenshots
          });

          const base64 = screenshotBuffer.toString('base64');

          screenshots.push({
            url,
            path,
            base64,
          });

          logger.info(`✓ Screenshot captured: ${url} (attempt ${attempts})`);
          success = true;

        } catch (pageError) {
          logger.warn(`✗ Attempt ${attempts} failed for ${url}:`, pageError);

          if (attempts > retries) {
            logger.error(`Failed to capture ${url} after ${attempts} attempts`);
            // Add placeholder screenshot without base64
            screenshots.push({
              url,
              path,
              base64: undefined,
            });
          }
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const successCount = screenshots.filter(s => s.base64).length;
  logger.info(`Captured ${successCount}/${paths.length} screenshots successfully`);

  return screenshots;
}

/**
 * Capture mobile screenshots
 */
export async function captureMobileScreenshots(
  domain: string,
  paths: string[]
): Promise<Screenshot[]> {
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE size
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    isMobile: true,
    hasTouch: true,
  });

  const screenshots: Screenshot[] = [];

  try {
    for (const path of paths) {
      const url = `https://${domain}${path}`;
      logger.info(`Capturing mobile screenshot: ${url}`);

      const page = await context.newPage();

      try {
        await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });

        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        const screenshotBuffer = await page.screenshot({
          fullPage: true,
          type: 'png',
        });

        const base64 = screenshotBuffer.toString('base64');

        screenshots.push({
          url: `${url} (mobile)`,
          path: `${path}_mobile`,
          base64,
        });

        logger.info(`Mobile screenshot captured: ${url}`);
      } catch (pageError) {
        logger.error(`Failed to capture mobile ${url}:`, pageError);
      } finally {
        await page.close();
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  return screenshots;
}
