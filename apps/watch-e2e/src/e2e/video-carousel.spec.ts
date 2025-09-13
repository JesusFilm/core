import { expect, test } from '@playwright/test'

/*
Test Video Carousel functionality:

Navigate to home page
Verify video carousel is visible
Test carousel navigation
Test video card interaction
*/
test('Video Carousel Navigation', async ({ page }) => {
  test.setTimeout(2 * 60 * 1000)

  await page.goto('/watch')

  // Wait for video carousel to load
  const videoCarousel = page.getByTestId('VideoCarousel')
  await videoCarousel.waitFor({ state: 'visible', timeout: 30000 })

  // Verify carousel is present
  await expect(videoCarousel).toBeVisible()

  // Verify at least one video card is present
  const videoCards = page.locator('[data-testid^="VideoCard-"]')
  await expect(videoCards.first()).toBeVisible()

  // Test navigation buttons if available
  const nextButton = page.getByTestId('NavButton').filter({ hasText: /next/i }).or(page.locator('[aria-label="Next slide"]'))
  const prevButton = page.getByTestId('NavButton').filter({ hasText: /prev/i }).or(page.locator('[aria-label="Previous slide"]'))

  // Check if navigation buttons exist and are functional
  if (await nextButton.isVisible()) {
    await nextButton.click()
    // Wait a moment for any animation
    await page.waitForTimeout(500)
  }

  if (await prevButton.isVisible()) {
    await prevButton.click()
    await page.waitForTimeout(500)
  }

  // Test keyboard navigation
  await videoCarousel.focus()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(300)
  await page.keyboard.press('ArrowLeft')
})

test('Video Card Click Navigation', async ({ page }) => {
  test.setTimeout(2 * 60 * 1000)

  await page.goto('/watch')

  // Wait for video carousel to load
  const videoCarousel = page.getByTestId('VideoCarousel')
  await videoCarousel.waitFor({ state: 'visible', timeout: 30000 })

  // Find and click the first available video card
  const videoCards = page.locator('[data-testid^="VideoCard-"]')
  const firstCard = videoCards.first()

  await firstCard.waitFor({ state: 'visible' })
  await firstCard.click()

  // Wait for navigation to occur
  await page.waitForURL('**/watch/**', { timeout: 30000 })

  // Verify we navigated to a video page
  expect(page.url()).toMatch(/\/watch\/.*\.html/)
})

test('Video Carousel Loading States', async ({ page }) => {
  await page.goto('/watch')

  // Check for loading skeletons initially
  const carousel = page.getByTestId('VideoCarousel')
  await carousel.waitFor({ state: 'visible' })

  // Eventually videos should load
  const videoCards = page.locator('[data-testid^="VideoCard-"]')
  await expect(videoCards.first()).toBeVisible({ timeout: 30000 })
})
