import { test, expect } from '@playwright/test'

/*  
Check homepage is accessible
Returns with 200 response
Get text of a locator and assert it's correct 
*/
test('Homepage checks', async ({ page }) => {
  const response = await page.goto('https://www.jesusfilm.org/watch')
  expect(response?.status()).toEqual(200)
  await expect(page).toHaveTitle(/Watch | Jesus Film Project/)
  const videoTitle = await page
  .getByRole('button', {
    name: 'Jesus Calms the Storm Jesus Calms the Storm Chapter 1:59'
  }).textContent()
  expect(videoTitle).toEqual('Jesus Calms the StormChapter1:59')
})
