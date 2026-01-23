import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './scripts',
  testMatch: 'screencast.spec.ts',
  timeout: 300000, // 5 minutes
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: 'list',

  use: {
    headless: false, // Show browser window
    viewport: { width: 1920, height: 1080 },
    video: {
      mode: 'on',
      size: { width: 1920, height: 1080 }
    },
    launchOptions: {
      slowMo: 300,
    },
    actionTimeout: 20000,
    navigationTimeout: 60000,
  },

  outputDir: '/tmp/playwright-results',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
