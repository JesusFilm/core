import { expect, test } from '@playwright/test'

/* 
This is just a sample test
Test that 'journeys-admin' part of the URL
*/
test('sample journeys-admin e2e test', async ({ page }) => {
  await page.goto('https://admin.nextstep.is/')

  // Get and log the current URL
  const url = page.url()
  console.log('Current URL:', url)

  // Test the URL
  await expect(page).toHaveURL(/.*journeys-admin/)

  await expect(page).toHaveScreenshot('home-page.png', {
    animations: 'disabled',
    fullPage: true
  })
})
