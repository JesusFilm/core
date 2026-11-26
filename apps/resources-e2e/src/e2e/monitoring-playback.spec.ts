import { expect, test } from '@playwright/test'

import { assertPlaybackProgress } from '../monitoring/watch-playback'

// assertPlaybackProgress contains the observable media assertions.
// eslint-disable-next-line playwright/expect-expect
test('accepts a video whose playback clock advances', async ({ page }) => {
  await page.setContent(
    '<canvas width="32" height="32"></canvas><video></video>'
  )
  await page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const video = document.querySelector('video')
    const context = canvas?.getContext('2d')
    if (canvas == null || video == null || context == null) {
      throw new Error('Playback fixture is missing')
    }
    // Generate real video frames without depending on an external media service.
    const drawFrame = (timestamp: number): void => {
      context.fillStyle = `rgb(${Math.floor(timestamp) % 255}, 0, 0)`
      context.fillRect(0, 0, canvas.width, canvas.height)
      requestAnimationFrame(drawFrame)
    }
    requestAnimationFrame(drawFrame)
    video.srcObject = canvas.captureStream()
  })

  await assertPlaybackProgress(page.locator('video'))
})

test('rejects a loaded video whose playback clock is frozen', async ({
  page
}) => {
  await page.setContent('<video></video>')
  await page.evaluate(() => {
    const video = document.querySelector('video')
    if (video == null) throw new Error('Playback fixture is missing')
    Object.defineProperties(video, {
      readyState: { get: () => HTMLMediaElement.HAVE_ENOUGH_DATA },
      paused: { get: () => false },
      play: { value: async () => undefined }
    })
  })

  await expect(
    assertPlaybackProgress(page.locator('video'), 1000)
  ).rejects.toThrow()
})

test('rejects a video with no playable media', async ({ page }) => {
  await page.setContent('<video></video>')

  await expect(
    assertPlaybackProgress(page.locator('video'), 1000)
  ).rejects.toThrow()
})
