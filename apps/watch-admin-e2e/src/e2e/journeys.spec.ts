import { test, expect } from '@playwright/test'

test('sample watch-admin e2e test', async ({ page }) => {
  await page.goto('/')

  // Get and log the current URL
  const url = await page.url();
  console.log('Current URL:', url);

  // Test the URL
  await expect(page).toHaveURL('watch-admin')
})
