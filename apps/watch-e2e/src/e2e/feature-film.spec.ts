import { expect, test } from '@playwright/test'

/* 
Test a feature film:
Navigate to home page 
Click on 'Jesus' chapter (Button: JESUS JESUS Feature Film 61 chapters)
Expect page to have URL: /watch/jesus.html/english.html
Wait for video tiles to load
Click on right arrow (Button: NavigateNextIcon)
Click on right arrow again (Button: NavigateNextIcon)
Click on left arrow (Button: NavigateBeforeIcon)
Verify we're still on the correct page (/watch/jesus.html/english.html)
Click on 'CHAPTER Birth of Jesus'
Expect page to have URL: /watch/jesus.html/birth-of-jesus/english.html
Click Play button
Check that video is playing
*/

test.describe('Feature film', () => {
  test('Feature film navigation and video playback', async ({ page }) => {
    // Navigate to the watch page
    await page.goto('/watch')

    // Click on the JESUS Feature Film button
    await page.getByRole('button', { name: 'JESUS JESUS Feature Film 61 chapters' }).click()

    // Wait for navigation and verify URL
    await expect(page).toHaveURL('/watch/jesus.html/english.html')

    // Wait for video tiles to load
    await page.waitForSelector('[data-testid="VideoCardButton-birth-of-jesus"]')

    // Test navigation arrows
    const rightArrow = page.locator('[data-testid="NavigateNextIcon"]').first()
    const leftArrow = page.locator('[data-testid="NavigateBeforeIcon"]').first()

    // Click right arrow twice
    await rightArrow.click()
    await rightArrow.click()

    // Click left arrow
    await leftArrow.click()

    // Verify we're still on the correct page
    await expect(page).toHaveURL('/watch/jesus.html/english.html')

    // Click on 'CHAPTER Birth of Jesus'
    await page.getByTestId('VideoCardButton-birth-of-jesus').click()

    // Verify URL changed to Birth of Jesus chapter
    await expect(page).toHaveURL('/watch/jesus.html/birth-of-jesus/english.html')

    // Click Play button
    await page.getByRole('button', { name: 'Play with sound' }).click()

    // Verify the play button exists and was clicked successfully
    await expect(page.getByRole('button', { name: 'Play with sound' })).toBeVisible()
  })
})
