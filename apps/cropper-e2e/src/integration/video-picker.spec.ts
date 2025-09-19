import { expect, test } from '@playwright/test'
import { navigateToCropper, selectVideo, waitForVideoCatalog } from '../support/cropper-helpers'

test.describe('Video picker workflow', () => {
  test('searches and selects a video from the library', async ({ page }) => {
    await navigateToCropper(page)
    await waitForVideoCatalog(page)

    await expect(page.getByRole('listitem')).toHaveCount(3)

    const searchInput = page.getByRole('textbox', { name: 'Search videos' })
    await searchInput.fill('city')

    await expect(page.getByRole('listitem')).toHaveCount(1)

    await selectVideo(page, 'city-runner')

    const selectedButton = page.getByRole('button', { name: 'Selected' })
    await expect(selectedButton).toBeVisible()
    await expect(page.locator('video')).toBeVisible()
  })
})
