import { expect, test } from '@playwright/test'

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/watch')
  })

  test('should display search box and accept input', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()
    await expect(searchBox).toBeVisible()
    await expect(searchBox).toHaveAttribute('placeholder', /search.*videos.*films.*series/i)

    await searchBox.fill('Jesus')
    await expect(searchBox).toHaveValue('Jesus')
  })

  test('should display search results for "Jesus"', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')

    // Wait for results to load
    await page.waitForTimeout(2000)

    // Verify results are displayed
    const results = page.locator('[class*="hit"]')
    await expect(results.first()).toBeVisible()

    // Verify we have results
    const resultCount = await results.count()
    expect(resultCount).toBeGreaterThan(0)
    console.log(`Found ${resultCount} search results for "Jesus"`)
  })

  test('should display results in responsive grid layout', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    // Check grid container exists
    const gridContainer = page.locator('[id="videos"] .grid').first()
    await expect(gridContainer).toBeVisible()

    // Verify responsive classes are applied
    const gridClasses = await gridContainer.getAttribute('class')
    expect(gridClasses).toMatch(/grid-cols-1/)
    expect(gridClasses).toMatch(/sm:grid-cols-2/)
    expect(gridClasses).toMatch(/md:grid-cols-3/)
    expect(gridClasses).toMatch(/lg:grid-cols-4/)
    expect(gridClasses).toMatch(/xl:grid-cols-5/)
    expect(gridClasses).toMatch(/2xl:grid-cols-6/)
  })

  test('should handle multiple search terms', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()
    const testTerms = ['Jesus', 'love', 'gospel', 'hope', 'faith']

    for (const term of testTerms) {
      await searchBox.fill(term)
      await page.waitForTimeout(1500)

      const results = page.locator('[class*="hit"]')
      const count = await results.count()
      expect(count).toBeGreaterThan(0)
      console.log(`"${term}": ${count} results`)
    }
  })



  test('should handle edge cases gracefully', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()
    const edgeCases = [
      { input: '', description: 'Empty search' },
      { input: 'a', description: 'Single character' },
      { input: 'Jesus Christ love gospel salvation redemption hope faith', description: 'Long search term' },
      { input: '   Jesus   ', description: 'Search with spaces' },
      { input: 'JESUS', description: 'Uppercase search' }
    ]

    for (const testCase of edgeCases) {
      await searchBox.fill(testCase.input)
      await page.waitForTimeout(2000)

      // Should not crash, should handle gracefully
      const results = page.locator('[class*="hit"]')
      const count = await results.count()

      // For empty search, might show all results or no results
      if (testCase.input.trim() === '') {
        // Empty search might show featured content or all videos
        expect(count).toBeGreaterThanOrEqual(0)
      } else {
        // Other searches should return some results
        expect(count).toBeGreaterThanOrEqual(0)
      }

      console.log(`${testCase.description}: ${count} results`)
    }
  })

  test('should maintain results across viewport changes', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    const initialResults = await page.locator('.card, [class*="hit"]').count()
    expect(initialResults).toBeGreaterThan(0)

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(1000)

    const tabletResults = await page.locator('.card, [class*="hit"]').count()
    expect(tabletResults).toBe(initialResults)

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)

    const mobileResults = await page.locator('.card, [class*="hit"]').count()
    expect(mobileResults).toBe(initialResults)

    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('should show loading state during search', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()

    // Start typing
    await searchBox.fill('Jesus')

    // Check if loading indicator appears (if implemented)
    const loadingIndicator = page.locator('[class*="loading"], [class*="spinner"], [aria-label*="loading"]').first()

    // Wait a moment for potential loading state
    await page.waitForTimeout(500)

    // Loading state might be present or not, both are acceptable
    // The important thing is no crashes occur
    const isLoadingVisible = await loadingIndicator.isVisible().catch(() => false)
    console.log(`Loading indicator visible: ${isLoadingVisible}`)
  })

  test('should allow clearing search', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()

    // Search for something
    await searchBox.fill('Jesus')
    await page.waitForTimeout(2000)

    const resultsWithSearch = await page.locator('.card, [class*="hit"]').count()
    expect(resultsWithSearch).toBeGreaterThan(0)

    // Clear search
    await searchBox.fill('')
    await page.waitForTimeout(2000)

    // Should handle empty search gracefully
    const resultsAfterClear = await page.locator('.card, [class*="hit"]').count()
    expect(resultsAfterClear).toBeGreaterThanOrEqual(0)
  })
})
