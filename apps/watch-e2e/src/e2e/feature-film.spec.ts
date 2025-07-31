import { expect, test } from '@playwright/test'

/* 
Test a feature film:
Navigate to home page 
Click on 'Jesus' chapter (Button: JESUS JESUS Feature Film 61 chapters)
Expect page to have URL: /watch/jesus.html/english.html
Wait for video tiles to load
Click on 'CHAPTER Birth of Jesus'
Expect page to have URL: /watch/jesus.html/birth-of-jesus/english.html
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
    const jesusButton = page.getByRole('button', {
      name: 'JESUS JESUS Feature Film 61 chapters'
    })
    await jesusButton.waitFor({ timeout: 30000 })
    await jesusButton.click()

    // Wait for navigation and verify URL with longer timeout
    await expect(page).toHaveURL('/watch/jesus.html/english.html', {
      timeout: 60000
    })

    // Wait for page to be fully loaded after navigation
    await page.waitForLoadState('domcontentloaded')

    // Wait for Birth of Jesus chapter to be available - try multiple selectors
    const birthOfJesusButton = page.locator(
      '[data-testid="VideoCardButton-birth-of-jesus"]'
    )
    await birthOfJesusButton.waitFor({ timeout: 30000 })

    // Click on 'CHAPTER Birth of Jesus'
    await birthOfJesusButton.click()

    // Wait for page to load after clicking chapter
    await page.waitForLoadState('domcontentloaded')

    // Verify URL changed to Birth of Jesus chapter
    await expect(page).toHaveURL(
      '/watch/jesus.html/birth-of-jesus/english.html',
      { timeout: 30000 }
    )
  })
})
