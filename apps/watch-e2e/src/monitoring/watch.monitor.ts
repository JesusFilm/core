import { expect, test } from '@playwright/test'

/*  
Check homepage is accessible
Returns with 200 response
Get text of a locator and assert it's correct 
*/
test('Homepage checks', async ({ page }) => {
  const response = await page.goto('https://www.jesusfilm.org/watch')
  expect(response?.status()).toEqual(200)
  await expect(page).toHaveTitle(/Watch | Jesus Film Project/)
  const videoTitle = page.getByRole('button', {
    name: 'Jesus Calms the Storm Jesus Calms the Storm Chapter 1:59'
  })

  await expect(videoTitle).toHaveText('Jesus Calms the StormChapter1:59')
})
