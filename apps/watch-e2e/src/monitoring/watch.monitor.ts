import { expect, test } from '@playwright/test'

/*  
Check homepage is accessible
Returns with 200 response
Assert that search bar and see all videos button are visible
*/
test('Homepage checks', async ({ page }) => {
  const response = await page.goto('https://www.jesusfilm.org/watch')
  expect(response?.status()).toEqual(200)
  await expect(page).toHaveTitle(/Watch | Jesus Film Project/)
  await expect(
    page.getByRole('heading', { name: 'Free Gospel Video Streaming' })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Watch, learn and share the' })
  ).toBeVisible()
  await expect(page.getByTestId('SearchBar')).toBeVisible()
  await expect(page.getByTestId('SeeAllVideos')).toBeVisible()
  await expect(page.getByTestId('WatchHomePage')).toContainText(
    'About Our ProjectWith 70% of the world not being able to speak English, there is a huge opportunity for the gospel to spread to unreached places. We have a vision to make it easier to watch, download and share Christian videos with people in their native heart language.Jesus Film Project is a Christian ministry with a vision to reach the world with the gospel of Jesus Christ through evangelistic videos. Watch from over 2000 languages on any device and share it with others.'
  )
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
