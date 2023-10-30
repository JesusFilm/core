/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'
import { chromium } from 'playwright-core'
import { playAudit } from 'playwright-lighthouse'

const config = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false
    }
  }
}

test.describe('Perform lighthouse audit', () => {
  test.use({ viewport: null })

  test('Check home page performance', async () => {
    const browser = await chromium.launch({
      args: ['--remote-debugging-port=9222', '--start-maximized']
    })
    const page = await browser.newPage()
    await page.goto('/')
    await playAudit({
      page,
      config,
      thresholds: {
        performance: 52,
        accessibility: 94,
        'best-practices': 83,
        seo: 82,
        pwa: 78
      },
      reports: {
        formats: { html: true },
        name: 'lighthouse-report'
        // Uncomment the line below to generate a new report every time
        // directory: 'lighthouse-report' + Date.now().toString()
      },
      port: 9222
    })
    await browser.close()
  })
})
