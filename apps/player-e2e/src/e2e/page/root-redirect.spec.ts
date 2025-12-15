import { expect, test } from '@playwright/test'

test('redirects root to jesusfilm watch', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/https:\/\/www\.jesusfilm\.org\/watch.*/)
})
