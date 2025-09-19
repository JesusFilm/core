import { expect, test } from '@playwright/test'
import { navigateToCropper, selectVideo, setTimelinePosition, timelineKeyframes, waitForVideoCatalog } from '../support/cropper-helpers'

test.describe('Timeline keyframe management', () => {
  test('adds a new keyframe at the current playhead position', async ({ page }) => {
    await navigateToCropper(page)
    await waitForVideoCatalog(page)
    await selectVideo(page)

    const keyframesBefore = await timelineKeyframes(page).count()
    expect(keyframesBefore).toBeGreaterThanOrEqual(2)

    await setTimelinePosition(page, 10)
    await page.getByRole('button', { name: 'Add Keyframe' }).click()

    await expect(page.getByRole('button', { name: 'Keyframe at 0:10' })).toBeVisible()

    const keyframesAfter = await timelineKeyframes(page).count()
    expect(keyframesAfter).toBeGreaterThan(keyframesBefore)
  })
})
