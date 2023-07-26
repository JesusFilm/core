import { playAudit } from 'playwright-lighthouse'
import playwright from 'playwright'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4100'

describe('Journey Lighthouse audits', () => {
  // List of URLs to test
  const urls = [
    BASE_URL,
    `${BASE_URL}/embed/fact-or-fiction`,
    `${BASE_URL}/fact-or-fiction`
  ]

  if (urls != null) {
    urls.forEach((url) => {
      it(`should pass Lighthouse audit for ${url}`, async () => {
        const port = 5000
        const browser = await playwright.chromium.launch({
          args: [`--remote-debugging-port=${port}`]
        })
        const page = await browser.newPage()
        await page.goto(url)

        // Run the Lighthouse audit
        await playAudit({
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

        await browser.close()
      })
    })
  }
})
