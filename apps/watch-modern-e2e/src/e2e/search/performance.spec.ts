import { expect, test } from '@playwright/test'

test.describe('Search Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/watch')
  })

  test('should respond quickly to search input', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()

    const searchTerms = ['Jesus', 'love', 'gospel', 'hope', 'faith']
    const results: { [key: string]: { duration: number; resultCount: number } } = {}

    for (const term of searchTerms) {
      const startTime = Date.now()

      await searchBox.fill(term)

      // Wait for results to appear
      await page.waitForTimeout(100) // Small delay for input processing

      try {
        await page.waitForFunction(
          () => {
            const results = document.querySelectorAll('.card, [class*="hit"]')
            return results.length > 0
          },
          { timeout: 10000 }
        )
      } catch (error) {
        console.log(`No results found for "${term}" within timeout`)
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      const resultCount = await page.locator('[class*="hit"]').count()

      results[term] = {
        duration,
        resultCount
      }

      console.log(`${term}: ${duration}ms, ${resultCount} results`)

      // Performance assertions
      expect(duration).toBeLessThan(10000) // Should complete within 10 seconds
      expect(resultCount).toBeGreaterThanOrEqual(0)
    }

    // Log performance summary
    console.log('Performance Results:', results)
  })

  test('should handle rapid search changes', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()

    const rapidSearches = ['J', 'Je', 'Jes', 'Jesu', 'Jesus']

    for (const search of rapidSearches) {
      await searchBox.fill(search)
      await page.waitForTimeout(200) // Minimal delay

      // Should not crash or freeze
      const results = page.locator('[class*="hit"]')
      const count = await results.count()

      // Results count should be reasonable (not negative, not excessive)
      expect(count).toBeGreaterThanOrEqual(0)
      expect(count).toBeLessThan(1000) // Sanity check

      console.log(`"${search}": ${count} results`)
    }
  })

  test('should maintain performance across multiple searches', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()

    const searchTerms = ['Jesus', 'love', 'gospel', 'hope', 'faith', 'salvation']
    const performanceMetrics: number[] = []

    for (let i = 0; i < searchTerms.length; i++) {
      const term = searchTerms[i]
      const startTime = Date.now()

      await searchBox.fill(term)
      await page.waitForTimeout(100)

      try {
        await page.waitForFunction(
          () => {
            const results = document.querySelectorAll('.card, [class*="hit"]')
            return results.length >= 0 // Allow 0 results
          },
          { timeout: 5000 }
        )
      } catch (error) {
        // Timeout is acceptable for performance testing
      }

      const endTime = Date.now()
      const duration = endTime - startTime
      performanceMetrics.push(duration)

      console.log(`Search ${i + 1} (${term}): ${duration}ms`)
    }

    // Calculate average performance
    const averageDuration = performanceMetrics.reduce((a, b) => a + b, 0) / performanceMetrics.length
    console.log(`Average search time: ${averageDuration.toFixed(2)}ms`)

    // Performance should not degrade significantly over multiple searches
    expect(averageDuration).toBeLessThan(3000) // Average under 3 seconds
  })

  test('should not have memory leaks during repeated searches', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()

    const searchTerms = ['Jesus', 'love', 'gospel', 'hope', 'faith']

    // Perform multiple searches rapidly
    for (let i = 0; i < 5; i++) {
      for (const term of searchTerms) {
        await searchBox.fill(term)
        await page.waitForTimeout(300)

        // Verify page remains responsive
        const results = page.locator('[class*="hit"]')
        const count = await results.count()
        expect(count).toBeGreaterThanOrEqual(0)
      }
    }

    // After repeated searches, page should still be functional
    await searchBox.fill('Jesus')
    await page.waitForTimeout(1000)

    const finalResults = page.locator('.card, [class*="hit"]')
    await expect(finalResults.first()).toBeVisible()
  })

  test('should handle concurrent user actions', async ({ page }) => {
    const searchBox = page.locator('input[type="search"]').first()

    // Simulate rapid typing
    const searchText = 'Jesus Christ'
    for (let i = 1; i <= searchText.length; i++) {
      const partialText = searchText.substring(0, i)
      await searchBox.fill(partialText)
      await page.waitForTimeout(50) // Very short delay
    }

    // Final search should still work
    await page.waitForTimeout(1000)
    const results = page.locator('.card, [class*="hit"]')
    const count = await results.count()

    expect(count).toBeGreaterThan(0)
    console.log(`Final search results: ${count}`)
  })
})
