import { expect, test } from '@playwright/test'

test('Watch Page', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', {
      name: /Free Gospel Video.*Streaming.*Library/i
    })
  ).toBeVisible()
  await expect(
    page.getByText(/Watch, learn and share the gospel in over 2000 languages/i)
  ).toBeVisible()
})
