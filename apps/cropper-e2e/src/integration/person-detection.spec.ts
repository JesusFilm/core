import { expect, test } from '@playwright/test'
import { navigateToCropper, selectVideo, timelineKeyframes, waitForVideoCatalog } from '../support/cropper-helpers'

test.describe('Person detection assistance', () => {
  test('runs the detection worker and merges suggested keyframes', async ({ page }) => {
    test.slow()

    await navigateToCropper(page)
    await waitForVideoCatalog(page)
    await selectVideo(page)

    const keyframesBefore = await timelineKeyframes(page).count()

    await page.getByRole('button', { name: 'Run auto tracking' }).click()

    await expect(page.getByText('Detection: running')).toBeVisible()
    await expect(page.locator('.border-success\\/60').first()).toBeVisible()

    await expect(page.getByText('Detection: complete')).toBeVisible({ timeout: 60000 })

    const keyframesAfter = await timelineKeyframes(page).count()
    expect(keyframesAfter).toBeGreaterThan(keyframesBefore)
  })
})
