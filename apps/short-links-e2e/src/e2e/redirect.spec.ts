import { expect, test } from '@playwright/test'

test('non-existent redirect results in 404', async ({ page }) => {
  const responsePromise = page.waitForResponse('/link-does-not-exist')
  await page.goto('/link-does-not-exist')
  const response = await responsePromise
  expect(response.status()).toBe(404)
  await expect(page.getByText("We've Lost This Page")).toBeVisible()
})
