import { playAudit } from 'playwright-lighthouse'
import playwright from 'playwright'

const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'http://localhost:4100'

describe('Journey Lighthouse audits', () => {
  // List of URLs to test
  const urls = [
    DEPLOYMENT_URL,
    `${DEPLOYMENT_URL}/embed/fact-or-fiction`,
    `${DEPLOYMENT_URL}/fact-or-fiction`
  ]

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
})
