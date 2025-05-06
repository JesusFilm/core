import { expect, test } from '@playwright/test'

/* 
This is just a sample test
Test that 'video-importer' part of the URL
*/
test('sample video-importer e2e test', async ({ page }) => {
  await page.goto('/')

  // Get and log the current URL
  const url = page.url()
  console.log('Current URL:', url)

  // Test the URL
  await expect(page).toHaveURL(/.*video-importer/)

  // await expect(page).toHaveScreenshot('home-page.png', {
  //   animations: 'disabled',
  //   fullPage: true
  // })
})
