/**
 * Screenshot Service - External API approach
 * Uses ScreenshotOne API for capturing store screenshots
 * Falls back to placeholder if API not configured
 */

import { logger } from './logger.server';

export interface Screenshot {
  url: string;
  path: string;
  base64?: string;
}

// ScreenshotOne API (free tier: 100 screenshots/month)
// Sign up at https://screenshotone.com/
const SCREENSHOT_API_KEY = process.env.SCREENSHOT_API_KEY || '';
const SCREENSHOT_API_URL = 'https://api.screenshotone.com/take';

/**
 * Capture screenshots using external API service
 * Much more reliable than running Playwright in constrained environments
 */
export async function captureScreenshotsExternal(
  domain: string,
  paths: string[]
): Promise<Screenshot[]> {
  // If API key not configured, return empty array (graceful degradation)
  if (!SCREENSHOT_API_KEY) {
    logger.info('Screenshots skipped: SCREENSHOT_API_KEY not configured');
    return paths.map(path => ({
      url: `https://${domain}${path}`,
      path,
      base64: undefined,
    }));
  }

  const screenshots: Screenshot[] = [];

  for (const path of paths) {
    const url = `https://${domain}${path}`;
    logger.info(`Capturing screenshot: ${url}`);

    try {
      const apiUrl = new URL(SCREENSHOT_API_URL);
      apiUrl.searchParams.set('access_key', SCREENSHOT_API_KEY);
      apiUrl.searchParams.set('url', url);
      apiUrl.searchParams.set('viewport_width', '1920');
      apiUrl.searchParams.set('viewport_height', '1080');
      apiUrl.searchParams.set('format', 'png');
      apiUrl.searchParams.set('full_page', 'false');
      apiUrl.searchParams.set('delay', '2'); // Wait for content to load
      apiUrl.searchParams.set('block_ads', 'true');
      apiUrl.searchParams.set('block_cookie_banners', 'true');

      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'image/png',
        },
      });

      if (!response.ok) {
        throw new Error(`Screenshot API error: ${response.status} ${response.statusText}`);
      }

      const imageBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');

      screenshots.push({
        url,
        path,
        base64,
      });

      logger.info(`✓ Screenshot captured: ${url}`);

    } catch (error) {
      logger.warn(`✗ Failed to capture ${url}:`, error);
      screenshots.push({
        url,
        path,
        base64: undefined,
      });
    }
  }

  const successCount = screenshots.filter(s => s.base64).length;
  logger.info(`Captured ${successCount}/${paths.length} screenshots via API`);

  return screenshots;
}

/**
 * Capture mobile screenshots
 */
export async function captureMobileScreenshotsExternal(
  domain: string,
  paths: string[]
): Promise<Screenshot[]> {
  if (!SCREENSHOT_API_KEY) {
    logger.info('Mobile screenshots skipped: SCREENSHOT_API_KEY not configured');
    return [];
  }

  const screenshots: Screenshot[] = [];

  for (const path of paths) {
    const url = `https://${domain}${path}`;
    logger.info(`Capturing mobile screenshot: ${url}`);

    try {
      const apiUrl = new URL(SCREENSHOT_API_URL);
      apiUrl.searchParams.set('access_key', SCREENSHOT_API_KEY);
      apiUrl.searchParams.set('url', url);
      apiUrl.searchParams.set('viewport_width', '375');
      apiUrl.searchParams.set('viewport_height', '812');
      apiUrl.searchParams.set('device_scale_factor', '2');
      apiUrl.searchParams.set('format', 'png');
      apiUrl.searchParams.set('full_page', 'true');
      apiUrl.searchParams.set('delay', '2');
      apiUrl.searchParams.set('block_ads', 'true');
      apiUrl.searchParams.set('block_cookie_banners', 'true');

      const response = await fetch(apiUrl.toString());

      if (!response.ok) {
        throw new Error(`Screenshot API error: ${response.status}`);
      }

      const imageBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');

      screenshots.push({
        url: `${url} (mobile)`,
        path: `${path}_mobile`,
        base64,
      });

      logger.info(`✓ Mobile screenshot captured: ${url}`);

    } catch (error) {
      logger.warn(`✗ Failed to capture mobile ${url}:`, error);
    }
  }

  return screenshots;
}
