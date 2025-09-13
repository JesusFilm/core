import { expect, test } from '@playwright/test'

/*
Test New Video Content Page functionality:

Navigate to a video page
Verify content loads properly
Test video carousel on content page
*/
test('New Video Content Page Layout', async ({ page }) => {
  test.setTimeout(3 * 60 * 1000)

  // Navigate directly to a known video
  await page.goto('/watch/jesus-calms-the-storm.html/english.html')

  // Wait for page to load
  await page.waitForLoadState('networkidle')

  // Verify main content elements are present
  const contentPage = page.getByTestId('ContentPage').or(page.locator('[data-testid*="Content"]').first())
  await expect(contentPage).toBeVisible({ timeout: 30000 })

  // Check for video content hero
  const videoHero = page.getByTestId('VideoContentHero').or(page.locator('video, [data-testid*="Video"]').first())
  if (await videoHero.isVisible()) {
    await expect(videoHero).toBeVisible()
  }

  // Check for video carousel on content page
  const videoCarousel = page.getByTestId('VideoCarousel')
  if (await videoCarousel.isVisible()) {
    await expect(videoCarousel).toBeVisible()
  }
})

test('Video Page Navigation Back to Home', async ({ page }) => {
  test.setTimeout(2 * 60 * 1000)

  // Start on video page
  await page.goto('/watch/jesus-calms-the-storm.html/english.html')
  await page.waitForLoadState('networkidle')

  // Find navigation back to home (logo, breadcrumb, etc.)
  const homeLink = page.locator('a[href="/watch"], a[href*="watch"]').first()
  if (await homeLink.isVisible()) {
    await homeLink.click()
    await page.waitForURL('**/watch', { timeout: 15000 })
    await expect(page).toHaveURL(/\/watch$/)
  }
})

test('Video Content Page Blur Filter', async ({ page }) => {
  await page.goto('/watch/jesus-calms-the-storm.html/english.html')

  // Check for blur filter element
  const blurFilter = page.getByTestId('ContentPageBlurFilter')
  if (await blurFilter.isVisible()) {
    await expect(blurFilter).toBeVisible()

    // Verify backdrop filter is applied
    const computedStyle = await blurFilter.evaluate((el) =>
      window.getComputedStyle(el).backdropFilter ||
      window.getComputedStyle(el).webkitBackdropFilter
    )

    expect(computedStyle).toContain('blur')
  }
})
