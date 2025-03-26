import { expect, test } from '@playwright/test'

/**
 * @check
 * @name Watch Monitoring
 * @retries 8 // Will retry the test 8 times
 * @retryInterval 10 // Will wait 10 seconds between retries
 * @maxRetryTime 600 // Will stop retrying after 10 minutes
 */
test('Watch Monitoring: Check if one of the video title is displayed', async ({
  page
}) => {
  const response = await page.goto('https://www.jesusfilm.org/watch')
  expect(response?.status()).toEqual(200)
  await expect(page).toHaveTitle(/Watch | Jesus Film Project/)
  const videoTitle = page.getByRole('button', {
    name: 'Jesus Calms the Storm Jesus Calms the Storm Chapter 1:59'
  })

  await expect(videoTitle).toHaveText('Jesus Calms the StormChapter1:59')
})
