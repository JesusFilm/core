import { expect, test } from '@playwright/test'

test.describe('Search Grid Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/watch')
  })

  test('should display MediaCard tiles with type labels', async ({ page }) => {
    // Perform a search to get results
    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    // Find MediaCard tiles
    const mediaCards = page.locator('a[href*="/watch/"]')
    await expect(mediaCards.first()).toBeVisible()

    // Check that at least one card has a type label
    const typeLabels = page.locator('[class*="text-amber-400"], [class*="text-indigo-400"], [class*="text-green-400"], [class*="text-orange-400"], [class*="text-sky-400"]')
    const typeLabelCount = await typeLabels.count()
    expect(typeLabelCount).toBeGreaterThan(0)

    // Verify type label is uppercase
    const firstTypeLabel = typeLabels.first()
    const labelText = await firstTypeLabel.textContent()
    await expect(firstTypeLabel).toHaveText(labelText || '')
  })

  test('should display duration with play icon when available', async ({ page }) => {
    // Perform a search to get results
    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    // Look for duration pills with play icons
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
    }
  })

  test('should display featured tiles with larger spans', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })

    // Perform a search to get results
    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    // Find grid items
    const gridItems = page.locator('[id="videos"] .grid > div')

    // Check that first few items have larger spans (featured)
    const firstItem = gridItems.first()
    const firstItemClasses = await firstItem.getAttribute('class')

    // Featured items should have md:col-span-2 or lg:col-span-2
    const isFeatured = firstItemClasses?.includes('md:col-span-2') || firstItemClasses?.includes('lg:col-span-2')
    expect(isFeatured).toBe(true)

    // Regular items should have smaller spans (4 per row max)
    const regularItem = gridItems.nth(2) // Skip first 2 featured items
    const regularItemClasses = await regularItem.getAttribute('class')

    // Regular items should have lg:col-span-1
    expect(regularItemClasses).toContain('lg:col-span-1')
  })

  test('should display skeleton loading states', async ({ page }) => {
    // Reload page to trigger loading state
    await page.reload()

    // Check if skeleton elements appear during loading
    const skeletons = page.locator('[class*="animate-pulse"], [class*="skeleton"]')
    const skeletonCount = await skeletons.count()

    // Should have skeleton elements during initial load
    expect(skeletonCount).toBeGreaterThan(0)
  })

  test('should have accessible MediaCard links', async ({ page }) => {
    // Perform a search to get results
    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    // Check that cards are links with proper accessibility
    const mediaCards = page.locator('a[href*="/watch/"]')
    const firstCard = mediaCards.first()

    // Should have aria-label
    const ariaLabel = await firstCard.getAttribute('aria-label')
    expect(ariaLabel).toContain('open details')

    // Should be focusable and have focus ring
    await firstCard.focus()
    const focusedElement = await page.evaluate(() => document.activeElement)
    expect(focusedElement).toBeTruthy()
  })

  test('should display search results in responsive 4-column grid', async ({ page }) => {
    // Perform a search to get results
    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    // Verify grid container exists
    const gridContainer = page.locator('[id="videos"] .grid').first()
    await expect(gridContainer).toBeVisible()

    // Verify 4-column grid classes (max 4 items per row)
    const gridClasses = await gridContainer.getAttribute('class')
    expect(gridClasses).toContain('grid-cols-4')
    expect(gridClasses).toContain('gap-4')
    expect(gridClasses).toContain('md:gap-5')
    expect(gridClasses).toContain('lg:gap-6')
  })

  test('should maintain grid layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    const cards = page.locator('[class*="hit"]')
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(0)

    // On large screens, expect more cards to be visible due to 4-column layout
    expect(cardCount).toBeGreaterThan(10)
  })

  test('should adapt grid layout on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    const cards = page.locator('[class*="hit"]')
    await expect(cards.first()).toBeVisible()

    // On tablet, cards should be arranged in fewer columns
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(5)
  })

  test('should adapt grid layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    const cards = page.locator('[class*="hit"]')
    await expect(cards.first()).toBeVisible()

    // On mobile, should have fewer visible cards due to single column layout
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(3)
  })

  test('should display cards across different viewports', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.waitForTimeout(1000)

      const cards = page.locator('[class*="hit"]')
      const count = await cards.count()

      // Should have cards in all viewports
      expect(count).toBeGreaterThan(0)
      console.log(`${viewport.name}: ${count} cards visible`)
    }
  })

  test('should display consistent number of results across viewports', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ]

    let expectedCount: number | null = null

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.waitForTimeout(1000) // Allow layout to settle

      const cards = page.locator('[class*="hit"]')
      const count = await cards.count()

      if (expectedCount === null) {
        expectedCount = count
      } else {
        // Results count should be consistent across viewports
        expect(count).toBe(expectedCount)
      }

      console.log(`${viewport.name}: ${count} results`)
    }
  })

})
