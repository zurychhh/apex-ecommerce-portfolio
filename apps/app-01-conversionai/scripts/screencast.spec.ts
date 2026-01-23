import { test, Page, FrameLocator } from '@playwright/test';

// Configuration
const SHOPIFY_STORE_URL = 'https://admin.shopify.com/store/conversionai-development';
const APP_DIRECT_URL = `${SHOPIFY_STORE_URL}/apps/conversionai`;

test.use({
  viewport: { width: 1920, height: 1080 },
  video: {
    mode: 'on',
    size: { width: 1920, height: 1080 }
  },
  launchOptions: {
    slowMo: 500, // Slower for better video
  }
});

test('ConversionAI Demo Video - 2.5 minutes', async ({ page }) => {
  test.setTimeout(600000); // 10 min timeout

  // Helper for pauses - longer for video quality
  const pause = (ms: number) => page.waitForTimeout(ms);

  // Helper to get app iframe
  const getAppFrame = () => page.frameLocator('iframe').first();

  // Helper to click in iframe with fallback to page
  const clickInApp = async (selectors: string[], description: string) => {
    const frame = getAppFrame();
    for (const selector of selectors) {
      try {
        const inFrame = frame.locator(selector).first();
        if (await inFrame.isVisible({ timeout: 3000 })) {
          console.log(`  Found "${description}" in iframe: ${selector}`);
          await inFrame.click({ timeout: 5000 });
          return true;
        }
      } catch {}
      try {
        const inPage = page.locator(selector).first();
        if (await inPage.isVisible({ timeout: 1000 })) {
          console.log(`  Found "${description}" in page: ${selector}`);
          await inPage.click({ timeout: 5000 });
          return true;
        }
      } catch {}
    }
    console.log(`  "${description}" not found`);
    return false;
  };

  // Helper to scroll in iframe
  const scrollInApp = async (pixels: number) => {
    try {
      await getAppFrame().locator('[class*="Polaris-Page"], body').first().evaluate((el, px) => {
        el.scrollBy({ top: px, behavior: 'smooth' });
      }, pixels);
    } catch {
      await page.evaluate((px) => window.scrollBy({ top: px, behavior: 'smooth' }), pixels);
    }
  };

  console.log('========================================');
  console.log('  CONVERSIONAI DEMO VIDEO RECORDING');
  console.log('  Target duration: 2.5 minutes');
  console.log('========================================\n');

  // ============================================
  // SECTION 1: OPEN APP & SHOW DASHBOARD (0:00 - 0:25)
  // ============================================
  console.log('[0:00] === SECTION 1: Dashboard ===');

  console.log('[0:02] Opening ConversionAI app...');
  await page.goto(APP_DIRECT_URL, { timeout: 60000 });
  await pause(3000);

  // Handle login if needed
  const needsLogin = await page.locator('input[type="email"], input[type="password"], button:has-text("Log in")').count() > 0;
  if (needsLogin) {
    console.log('[0:05] LOGIN REQUIRED - waiting 2 minutes for manual login...');
    await page.waitForURL(/.*apps.*conversionai.*/, { timeout: 120000 }).catch(() => {});
  }

  await pause(3000);
  console.log('[0:10] App loaded - showing empty dashboard...');

  // PAUSE: Show empty dashboard for 4 seconds
  await pause(4000);
  console.log('[0:15] Dashboard displayed (4 sec pause)');

  // ============================================
  // SECTION 2: RUN ANALYSIS (0:25 - 1:15)
  // ============================================
  console.log('\n[0:25] === SECTION 2: Run AI Analysis ===');

  console.log('[0:27] Looking for "Run New Analysis" button...');
  const analysisClicked = await clickInApp([
    'button:has-text("Run New Analysis")',
    'a:has-text("Run New Analysis")',
    'button:has-text("Start Analysis")',
    'a:has-text("Start Analysis")',
    'button:has-text("Get Started")',
    'a:has-text("Get Started")',
    '[class*="Polaris-Button--primary"]',
  ], 'Run New Analysis');

  if (!analysisClicked) {
    console.log('[0:30] Button not found - trying navigation link...');
    await clickInApp(['a[href*="analysis"]', 'a[href*="run"]'], 'analysis link');
  }

  await pause(2000);
  console.log('[0:32] Analysis started - AI is working...');

  // Wait for analysis with status updates
  const startTime = Date.now();
  let analysisComplete = false;

  while (!analysisComplete && (Date.now() - startTime) < 90000) {
    await pause(5000);
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`  ... AI analyzing (${elapsed}s)`);

    // Check for recommendations appearing
    try {
      const frame = getAppFrame();
      const cards = await frame.locator('[class*="Polaris-Card"]').count();
      const viewButtons = await frame.locator('button:has-text("View"), a:has-text("View")').count();

      if (cards > 3 || viewButtons > 0) {
        analysisComplete = true;
        console.log(`[1:00] Analysis complete! Found ${cards} cards, ${viewButtons} view buttons`);
      }
    } catch {}
  }

  if (!analysisComplete) {
    console.log('[1:00] Analysis still running - continuing...');
  }

  // PAUSE: Show recommendations appeared for 4 seconds
  await pause(4000);
  console.log('[1:05] Recommendations displayed (4 sec pause)');

  // Slow scroll to show all recommendations
  console.log('[1:10] Scrolling through recommendations...');
  await scrollInApp(300);
  await pause(2000);

  // ============================================
  // SECTION 3: VIEW FIRST RECOMMENDATION (1:15 - 1:50)
  // ============================================
  console.log('\n[1:15] === SECTION 3: View Recommendation Details ===');

  console.log('[1:17] Clicking "View" on first recommendation...');
  const viewClicked = await clickInApp([
    'button:has-text("View")',
    'a:has-text("View")',
    '[class*="Polaris-Button"]:has-text("View")',
  ], 'View button');

  await pause(3000);
  await page.waitForLoadState('domcontentloaded').catch(() => {});

  if (viewClicked) {
    console.log('[1:22] Recommendation detail page opened');

    // PAUSE: Show title and scores for 4 seconds
    await pause(4000);
    console.log('[1:26] Showing title and Impact/Effort scores (4 sec pause)');

    // Scroll to show description
    console.log('[1:30] Scrolling to show description...');
    await scrollInApp(350);
    await pause(3000);
    console.log('[1:35] Description visible (3 sec pause)');

    // Scroll to show code snippet
    console.log('[1:38] Scrolling to code snippet...');
    await scrollInApp(400);
    await pause(4000);
    console.log('[1:43] Code snippet visible (4 sec pause)');
  }

  // ============================================
  // SECTION 4: VIEW SECOND RECOMMENDATION (1:50 - 2:15)
  // ============================================
  console.log('\n[1:50] === SECTION 4: View Another Recommendation ===');

  // Go back to list
  console.log('[1:52] Going back to recommendations list...');
  const backClicked = await clickInApp([
    'a:has-text("Back")',
    'button:has-text("Back")',
    '[class*="Polaris-Page"] a:first-child',
    'nav a',
  ], 'Back button');

  if (!backClicked) {
    await page.goBack().catch(() => {});
  }

  await pause(3000);
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  console.log('[1:57] Back on recommendations list');

  // Scroll to show more recommendations
  await scrollInApp(200);
  await pause(2000);

  // Click on second recommendation
  console.log('[2:00] Clicking "View" on second recommendation...');
  try {
    const frame = getAppFrame();
    const secondView = frame.locator('button:has-text("View"), a:has-text("View")').nth(1);
    if (await secondView.isVisible({ timeout: 3000 })) {
      await secondView.click();
      await pause(3000);
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      console.log('[2:05] Second recommendation opened');

      // PAUSE: Show this recommendation
      await pause(4000);
      console.log('[2:10] Showing second recommendation (4 sec pause)');
    }
  } catch {
    console.log('[2:05] Second recommendation not accessible');
  }

  // ============================================
  // SECTION 5: UPGRADE CTA (2:15 - 2:30)
  // ============================================
  console.log('\n[2:15] === SECTION 5: Upgrade Plan ===');

  // Go back first
  await page.goBack().catch(() => {});
  await pause(2000);

  // Scroll to top to find Upgrade button
  try {
    await getAppFrame().locator('[class*="Polaris-Page"], body').first().evaluate((el) => {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } catch {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
  await pause(2000);

  console.log('[2:20] Looking for "Upgrade Plan" button...');
  const upgradeClicked = await clickInApp([
    'a:has-text("Upgrade Plan")',
    'button:has-text("Upgrade Plan")',
    'a:has-text("Upgrade")',
    'button:has-text("Upgrade")',
    'a[href*="upgrade"]',
  ], 'Upgrade Plan');

  if (upgradeClicked) {
    await pause(3000);
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    console.log('[2:25] Pricing page displayed');

    // PAUSE: Show pricing for 5 seconds
    await pause(5000);
    console.log('[2:30] Showing pricing options (5 sec pause)');
  } else {
    console.log('[2:25] Upgrade button not found');
    await pause(3000);
  }

  // ============================================
  // END
  // ============================================
  console.log('\n[2:35] === END OF DEMO VIDEO ===');
  await pause(2000);

  console.log('\n========================================');
  console.log('  RECORDING COMPLETE!');
  console.log('  Video saved to: /tmp/playwright-results/');
  console.log('========================================');
});
