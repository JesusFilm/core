import { expect, test } from '@playwright/test'

/* 
This is just a sample test
Test that 'arclight' part of the URL
*/
test('redirect results in 404', async ({ page }) => {
  await page.goto('/link-does-not-exist')

  // Get and log the current URL
  const url = page.url()
  console.log('Current URL:', url)

  // Test the response status
  const response = await page.waitForResponse(
    (response) => response.status() === 404
  )
  expect(response.status()).toBe(404)
})
