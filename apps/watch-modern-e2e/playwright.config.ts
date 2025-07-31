import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config()

export default defineConfig({
  testDir: './src/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 8 : undefined,
  reporter: 'html',
  use: {
    baseURL:
      process.env.WATCH_MODERN_DAILY_E2E ??
      process.env.DEPLOYMENT_URL ??
      'http://localhost:4800',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    }
  ]
})
