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
    test.setTimeout(4 * 60 * 1000)

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

    // Wait for navigation to complete
    await page.waitForURL('**/jesus.html/**', { timeout: 60000 })

    // Wait for navigation and verify URL with longer timeout
    await expect(page).toHaveURL('/watch/jesus.html/english.html', {
      timeout: 60000
    })

    // Wait for page to be fully loaded after navigation
    await page.waitForLoadState('domcontentloaded')

    // Wait for the JESUS page content to load (look for elements that indicate we're on the JESUS page)
    await page.waitForSelector('h1:has-text("JESUS")', { timeout: 60000 })

    // Wait for video carousel to load
    await page.waitForSelector('[data-testid="VideoCarousel"]', { timeout: 60000 })

    // Wait for Birth of Jesus chapter to be available
    const birthOfJesusButton = page.getByTestId('VideoCardButton-birth-of-jesus')
    await birthOfJesusButton.waitFor({ timeout: 60000 })

    // Wait for the element to be properly interactive
    await birthOfJesusButton.waitFor({ state: 'visible' })
    await expect(birthOfJesusButton).toBeEnabled()

    // Click on 'CHAPTER Birth of Jesus'
    await birthOfJesusButton.click()

    // Wait for navigation to complete
    await page.waitForURL('**/birth-of-jesus/**', { timeout: 60000 })

    // Wait for page to load after clicking chapter
    await page.waitForLoadState('domcontentloaded')

    // Verify URL changed to Birth of Jesus chapter
    await expect(page).toHaveURL(
      '/watch/jesus.html/birth-of-jesus/english.html',
      { timeout: 60000 }
    )
  })
})
