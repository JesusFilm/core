import { expect, test } from '@playwright/test'

test('Watch Page', async ({ page }) => {
  await page.goto('/watch')
  await expect(page.getByText(/Watch.*gospel.*languages/)).toBeVisible()
})
