import { test, expect } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'
import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4100'

// List of URLs to test
const URLs = [
  BASE_URL
  // `${BASE_URL}/embed/fact-or-fiction`,
  // `${BASE_URL}/fact-or-fiction`
]

URLs.forEach((url) => {
  test(`should pass Lighthouse audit for ${url}`, async () => {
    const port = 5000
    const browser = await chromium.launch({
      args: [`--remote-debugging-port=${port}`]
    })
    const page = await browser.newPage()
    await page.goto(url)

    // Run the Lighthouse audit
    await expect(
      playAudit({
        page,
        thresholds: {
          performance: 50,
          accessibility: 80,
          'best-practices': 100,
          seo: 90,
          pwa: 80
        },
        reports: {
          formats: {
            json: true
          }
        },
        port: 9222
      })
    ).resolves.not.toThrow()

    await browser.close()
  })
})
