import { expect, test } from '@playwright/test'

import { assertPlaybackProgress } from './watch-playback'

// 60s: two SSR navigations, HLS initialization and observable playback progress.
test.setTimeout(60000)

test('Watch video can be opened and played', async ({ page }) => {
  const response = await page.goto('https://www.jesusfilm.org/watch')
  expect(response?.status()).toBe(200)
  await expect(page).toHaveTitle('Watch | Jesus Film Project')

  await page
    .getByRole('button', {
      name: 'Jesus Calms the Storm Jesus Calms the Storm Chapter 1:59',
      exact: true
    })
    .click()
  await expect(page).toHaveURL(
    'https://www.jesusfilm.org/watch/jesus-calms-the-storm.html/english.html'
  )

  // Metadata or a video element alone cannot prove that the stream plays.
  await assertPlaybackProgress(page.locator('video'))
})
