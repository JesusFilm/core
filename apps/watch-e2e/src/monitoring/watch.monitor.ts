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

/*  
Check https://arc.gt/s/1_jf-0-0/529 is redirected to
https://www.jesusfilm.org/watch/jesus.html/english.html 
*/

test('Check redirect', async ({ page }) => {
  const response = await page.goto('https://arc.gt/s/1_jf-0-0/529')
  expect(response?.status()).toEqual(200)
  expect(response?.url()).toEqual(
    'https://www.jesusfilm.org/watch/jesus.html/english.html'
  )
})
