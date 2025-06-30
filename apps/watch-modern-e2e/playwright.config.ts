import { defineConfig, devices } from '@playwright/test'

// For CI, you may want to set BASE_URL to the deployed application.
// const baseURL = process.env['BASE_URL'] || 'http://localhost:3000'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // ...nxE2EPreset(__filename, { testDir: './src' }),
  timeout: 3 * 60 * 1000,
  testDir: './src/e2e',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 3 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 12 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    permissions: ['clipboard-read', 'clipboard-write'],
    /* Base URL to use in actions like `await page.goto('/')`. */
    actionTimeout: 20000,
    navigationTimeout: 60000,
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    // https://testsigma.com/blog/common-screen-resolutions/
    viewport: { width: 1920, height: 1080 }
    // baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    // trace: 'on-first-retry'
  },
  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npx nx run watch-modern:start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   cwd: workspaceRoot
  // },
  projects: [
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

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ]
})
