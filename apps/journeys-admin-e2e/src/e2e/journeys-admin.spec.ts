import { test, expect } from '@playwright/test'
/* 
This is just a sample test
Test that 'journeys-admin' part of the URL
*/
test('sample journeys-admin e2e test', async ({ page }) => {
  await page.goto('/')

  // Get and log the current URL
  const url = await page.url()
  console.log('Current URL:', url)

  // Test the URL
  await expect(page).toHaveURL(/.*journeys-admin/)
})
