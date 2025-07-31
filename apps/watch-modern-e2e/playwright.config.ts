import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 8 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PR_NUMBER
      ? `https://watch-modern-${process.env.PR_NUMBER}-jesusfilm.vercel.app/`
      : (process.env.DEPLOYMENT_URL ?? 'http://localhost:4800'),
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
