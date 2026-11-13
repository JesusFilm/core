import { expect, test } from '@playwright/test'

import { assertPlaybackProgress } from './watch-playback'

// 60s: two SSR navigations, HLS initialization and observable playback progress.
test.setTimeout(60000)

test('Watch homepage loads and Life of Jesus plays', async ({ page }) => {
  const response = await page.goto('https://www.jesusfilm.org/watch')
  expect(response?.status()).toBe(200)
  await expect(page).toHaveTitle(/Jesus Film Project$/)

  // Use the live monitor's Life of Jesus target without depending on homepage cards.
  const videoResponse = await page.goto(
    'https://www.jesusfilm.org/watch/life-of-jesus-gospel-of-john.html'
  )
  expect(videoResponse?.status()).toBe(200)

  await page.getByRole('button', { name: 'Watch now', exact: true }).click()

  // Metadata or a video element alone cannot prove that the stream plays.
  await assertPlaybackProgress(page.locator('video'))
})
