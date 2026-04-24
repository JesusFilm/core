import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from `apps/player-e2e/.env`.
 * https://github.com/motdotla/dotenv
 */
const { loadPlaywrightEnv } = require('../../tools/e2e/playwright-load-env.cjs')
loadPlaywrightEnv(__dirname)

export default defineConfig({
  testDir: './src/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 0,
  workers: process.env.CI ? 8 : 1,
  reporter: 'html',
  use: {
    baseURL:
      process.env.PLAYER_DAILY_E2E ??
      process.env.DEPLOYMENT_URL ??
      'http://localhost:4700',
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
