import { expect, test } from '@playwright/test'

test.describe('Search Grid Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/watch')
  })

  test('should display search results in responsive grid', async ({ page }) => {
    // Perform a search to get results
    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    // Verify grid container exists
    const gridContainer = page.locator('[id="videos"] .grid').first()
    await expect(gridContainer).toBeVisible()

    // Verify responsive grid classes
    const gridClasses = await gridContainer.getAttribute('class')
    expect(gridClasses).toContain('grid-cols-1')
    expect(gridClasses).toContain('sm:grid-cols-2')
    expect(gridClasses).toContain('md:grid-cols-3')
    expect(gridClasses).toContain('lg:grid-cols-4')
    expect(gridClasses).toContain('xl:grid-cols-5')
    expect(gridClasses).toContain('2xl:grid-cols-6')
  })

  test('should maintain grid layout on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    const cards = page.locator('[class*="hit"]')
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(0)

    // On large screens, expect more cards to be visible due to 6-column layout
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
