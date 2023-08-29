import { expect, test } from '@playwright/test'

/* 
This is just a sample test
Test that 'docs' part of the URL
*/
test('sample docs e2e test', async ({ page }) => {
  await page.goto('/')

  // Get and log the current URL
  const url = page.url()
  console.log('Current URL:', url)

  // Test the URL
  await expect(page).toHaveURL(/.*docs/)

  await expect(page).toHaveScreenshot({
    animations: 'disabled',
    fullPage: true
  })
})
