import { expect, test } from '@playwright/test'
import { navigateToCropper, selectVideo, setTimelinePosition, waitForVideoCatalog } from '../support/cropper-helpers'

test.describe('Crop workspace interaction', () => {
  test('enables controls after selecting a video and scrubbing the timeline', async ({ page }) => {
    await navigateToCropper(page)
    await waitForVideoCatalog(page)

    const addKeyframeButton = page.getByRole('button', { name: 'Add Keyframe' })
    await expect(addKeyframeButton).toBeDisabled()

    await selectVideo(page)

    await expect(addKeyframeButton).toBeEnabled()

    await setTimelinePosition(page, 45)
    await expect(page.getByText(/0:45\s*\/\s*/)).toBeVisible()
  })
})
