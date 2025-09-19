import { expect, test } from '@playwright/test'
import { navigateToCropper, selectVideo, waitForVideoCatalog } from '../support/cropper-helpers'

test.describe('Export workflow', () => {
  test('queues and completes an export job from the dialog', async ({ page }) => {
    await navigateToCropper(page)
    await waitForVideoCatalog(page)
    await selectVideo(page)

    await page.getByRole('button', { name: 'Export video' }).click()

    const storyPreset = page.getByRole('radio', { name: 'Story 720x1280' })
    await storyPreset.check()

    await page.getByRole('button', { name: 'Start export' }).click()

    await expect(page.getByText('Status: processing')).toBeVisible()

    await expect(page.getByText('Status: complete')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('100%')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Download result' })).toBeVisible()
  })
})
