import { expect, test } from '@playwright/test'

test('Watch Page', async ({ page }) => {
  await page.goto('/watch')
  await expect(page.locator('p')).toHaveText(
    'Watch, learn and share the gospel in over 2000 languages'
  )
})
