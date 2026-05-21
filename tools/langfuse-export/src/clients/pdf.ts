// Optional HTML -> PDF render via Playwright Chromium. Imported dynamically
// by run.ts only under --pdf, so the Playwright cost is never paid otherwise.
// Chromium is a separate one-time install; we translate the missing-binary
// error into the exact remediation command.

import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

export async function renderPdf(htmlPath: string, pdfPath: string): Promise<void> {
  let browser
  try {
    browser = await chromium.launch()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/executable doesn't exist|playwright install/i.test(message)) {
      throw new Error(
        'Chromium is not installed for Playwright. Run: pnpm exec playwright install chromium'
      )
    }
    throw error
  }

  try {
    const page = await browser.newPage()
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' })
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true })
  } finally {
    await browser.close()
  }
}
