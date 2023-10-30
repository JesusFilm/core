import { test } from '@playwright/test'
import { chromium } from 'playwright-core'
import { playAudit } from 'playwright-lighthouse'

const lighthouseConfiguration = async (): Promise<void> => {
  const browser = await chromium.launch({
    args: ['--remote-debugging-port=9222', '--start-maximized']
  })
  const page = await browser.newPage()
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
  await page.goto('https://playwright.dev/')
  await playAudit({
    page,
    config,
    thresholds: {
      performance: 50,
      accessibility: 50
    },
    reports: {
      formats: { html: true },
      name: 'lighthouse-report',
      directory: 'lighthouse-report' + Date.now().toString()
    },
    port: 9222
  })
  await browser.close()
}

test.describe('Perform lighthouse audit', () => {
  test.use({ viewport: null })

  test(
    'Configure lighthouse for performance and accessibility audit',
    lighthouseConfiguration
  )
})
