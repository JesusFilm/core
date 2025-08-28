import type { Page } from '@playwright/test'

export async function isVisible(page: Page, locator: string): Promise<boolean> {
  // eslint-disable-next-line playwright/no-wait-for-selector
  await page.waitForSelector(locator)
  return await page.isVisible(locator)
}
