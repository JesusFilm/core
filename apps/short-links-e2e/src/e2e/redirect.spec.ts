import { expect, test } from '@playwright/test'

test('redirect results in 404', async ({ page }) => {
  expect(page.goto('/link-does-not-exist'))
  const response = await page.waitForResponse(
    (response) => response.status() === 404
  )
  expect(response.status()).toBe(404)
})
