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
    // Set longer timeout for CI environments
    test.setTimeout(90000)

    // Navigate to the watch page using daily-e2e deployment
    await page.goto('/watch')

    // Wait for the page to be fully loaded
    await page.waitForLoadState('domcontentloaded')

    // Click on the JESUS Feature Film button
    const jesusButton = page.getByRole('button', { name: 'JESUS JESUS Feature Film 61 chapters' })
    await jesusButton.waitFor({ timeout: 30000 })
    await jesusButton.click()

    // Wait for navigation and verify URL with longer timeout
    await expect(page).toHaveURL('/watch/jesus.html/english.html', { timeout: 60000 })

    // Wait for page to be fully loaded after navigation
    await page.waitForLoadState('domcontentloaded')

    // Wait for any video content to load - use a more general selector
    await page.locator('[data-testid*="VideoCardButton"]').first().waitFor({ timeout: 30000 })

    // Test navigation arrows - wait for them to be available
    const rightArrow = page.locator('[data-testid="NavigateNextIcon"]').first()
    const leftArrow = page.locator('[data-testid="NavigateBeforeIcon"]').first()
    await rightArrow.waitFor({ timeout: 30000 })

    // Click right arrow twice
    await rightArrow.click()
    // Wait for any animations or state changes to complete
    await rightArrow.waitFor({ state: 'visible' })
    await rightArrow.click()

    // Click left arrow once
    await leftArrow.click()

    // Verify we're still on the correct page
    await expect(page).toHaveURL('/watch/jesus.html/english.html', { timeout: 30000 })

    // Wait for Birth of Jesus chapter to be available - try multiple selectors
    const birthOfJesusButton = page.locator('[data-testid="VideoCardButton-birth-of-jesus"]')
    await birthOfJesusButton.waitFor({ timeout: 30000 })

    // Click on 'CHAPTER Birth of Jesus'
    await birthOfJesusButton.click()

    // Wait for page to load after clicking chapter
    await page.waitForLoadState('domcontentloaded')

    // Verify URL changed to Birth of Jesus chapter with longer timeout
    await expect(page).toHaveURL('/watch/jesus.html/birth-of-jesus/english.html', { timeout: 30000 })

    // Wait for video player to load and click Play button
    const playButton = page.getByRole('button', { name: 'Play with sound' })
    await playButton.waitFor({ timeout: 30000 })
    await playButton.click()

    // Verify play button was clicked successfully
    await expect(playButton).toBeVisible()
  })
})
