/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config()

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 3 * 60 * 1000,
  testDir: './src/e2e',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 3 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 15 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    permissions: ['clipboard-read', 'clipboard-write'],
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL:
      process.env.JOURNEYS_ADMIN_DAILY_E2E ??
      process.env.DEPLOYMENT_URL ??
      'http://localhost:4100',
    actionTimeout: 20000,
    navigationTimeout: 60000,
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    // https://testsigma.com/blog/common-screen-resolutions/
    viewport: { width: 1920, height: 1080 }
  },

  /* Configure projects for major browsers */
  projects: [
    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'chrome-desktop',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' }
    // },

    // /* Test against mobile viewports. */
    // // By default it's using chromium channel, changed it to chrome so it can play the video
    // {
    //   name: 'chrome-mobile',
    //   use: { ...devices['Pixel 5'], channel: 'chrome' }
    // }
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Others. */
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // Video is not playing on chromium, so we use chrome instead
    {
      name: 'chrome-desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel:
          process.platform === 'linux' && process.arch === 'arm64'
            ? 'chromium'
            : 'chrome'
      }
    }
  ]

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
})
