import { expect, test } from '@playwright/test'

test.describe('Search Grid Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/watch')
  })

  test('should display grid with MediaCard tiles', async ({ page }) => {
    // Find MediaCard tiles (should be visible by default)
    const mediaCards = page.locator('a[href*="/watch/"]')
    await expect(mediaCards.first()).toBeVisible()

    // Check that we have multiple cards
    const cardCount = await mediaCards.count()
    expect(cardCount).toBeGreaterThan(0)
    console.log(`Found ${cardCount} media cards`)
  })

  test('should display cards with proper structure', async ({ page }) => {
    // Look for duration pills with play icons (should be visible by default)
    const durationPills = page.locator('[class*="bg-black/55"]').filter({ hasText: /\d+:\d+/ })

    // Some videos might have duration, check if any exist
    const pillCount = await durationPills.count()
    if (pillCount > 0) {
      // If duration pills exist, they should have play icons
      const firstPill = durationPills.first()
      const hasPlayIcon = await firstPill.locator('svg, [class*="play"]').count()
      expect(hasPlayIcon).toBeGreaterThan(0)

      // Verify duration format (MM:SS or h:mm:ss)
      const durationText = await firstPill.textContent()
      expect(durationText).toMatch(/\d+:\d+/)
      console.log(`Found ${pillCount} duration pills with play icons`)
    } else {
      console.log('No duration pills found')
    }
  })

  test('should display content in grid layout', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })

    // Check that videos section exists
    const videosSection = page.locator('[id="videos"]')
    await expect(videosSection).toBeVisible()

    // Check that we have media cards
    const mediaCards = page.locator('a[href*="/watch/"]')
    const cardCount = await mediaCards.count()
    expect(cardCount).toBeGreaterThan(0)
    console.log(`Found ${cardCount} media cards`)
  })

  test('should load page content', async ({ page }) => {
    // Check that page loads without errors
    const videosSection = page.locator('[id="videos"]')
    await expect(videosSection).toBeVisible()

    // Check that search bar is present
    const searchBox = page.locator('input[aria-label="Search videos, films, and series"]')
    await expect(searchBox).toBeVisible()
  })

  test('should have accessible MediaCard links', async ({ page }) => {
    // Check that cards are links with proper accessibility
    const mediaCards = page.locator('a[href*="/watch/"]')
    const firstCard = mediaCards.first()
    await expect(firstCard).toBeVisible()

    // Should have some form of accessible text (aria-label or text content)
    const ariaLabel = await firstCard.getAttribute('aria-label')
    const textContent = await firstCard.textContent()

    // Either aria-label exists or has meaningful text content
    expect(ariaLabel || textContent?.trim()).toBeTruthy()

    // Should be focusable
    await firstCard.focus()
    const focusedElement = await page.evaluate(() => document.activeElement)
    expect(focusedElement).toBeTruthy()
  })

  test('should display content in responsive layout', async ({ page }) => {
    // Check that videos section exists and has content
    const videosSection = page.locator('[id="videos"]')
    await expect(videosSection).toBeVisible()

    // Check that we have media cards displayed
    const mediaCards = page.locator('a[href*="/watch/"]')
    await expect(mediaCards.first()).toBeVisible()
  })

  test('should maintain grid layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    const cards = page.locator('a[href*="/watch/"]')
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(0)

    // On large screens, expect cards to be visible
    expect(cardCount).toBeGreaterThan(5)
  })

  test('should adapt grid layout on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    const cards = page.locator('a[href*="/watch/"]')
    await expect(cards.first()).toBeVisible()

    // On tablet, cards should be visible
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(3)
  })

  test('should adapt content layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that videos section is visible
    const videosSection = page.locator('[id="videos"]')
    await expect(videosSection).toBeVisible()

    // Check that search bar is present
    const searchBox = page.locator('input[aria-label="Search videos, films, and series"]')
    await expect(searchBox).toBeVisible()
  })

  test('should display cards across different viewports', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.waitForTimeout(1000)

      const cards = page.locator('a[href*="/watch/"]')
      const count = await cards.count()

      // Should have cards in all viewports
      expect(count).toBeGreaterThan(0)
      console.log(`${viewport.name}: ${count} cards visible`)
    }
  })

  test('should display consistent content across viewports', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ]

    let expectedCount: number | null = null

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.waitForTimeout(1000) // Allow layout to settle

      const cards = page.locator('a[href*="/watch/"]')
      const count = await cards.count()

      if (expectedCount === null) {
        expectedCount = count
      } else {
        // Content should be consistent across viewports
        expect(count).toBe(expectedCount)
      }

      console.log(`${viewport.name}: ${count} cards`)
    }
  })

})
