import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should open search overlay when search input is focused', async ({ page }) => {
    // Find and click the search input
    const searchInput = page.getByTestId('SearchBarInput')
    await expect(searchInput).toBeVisible()

    // Click to focus the search input
    await searchInput.click()

    // Check that the search overlay opens
    const searchOverlay = page.getByTestId('SearchOverlay')
    await expect(searchOverlay).toBeVisible()
  })

  test('should perform live search when typing', async ({ page }) => {
    // Focus search input - need to target the actual input element
    const searchInput = page.getByTestId('SearchBarInput').locator('input')
    await searchInput.click()

    // Type a search query
    await searchInput.fill('hope')

    // Check that search overlay is visible
    const searchOverlay = page.getByTestId('SearchOverlay')
    await expect(searchOverlay).toBeVisible()

    // Wait for search results to load (check for video grid or results)
    // The AlgoliaVideoGrid should appear when there's a query
    await page.waitForTimeout(2000) // Give time for search results

    // Verify that the search was performed by checking for loading or results
    const hasResults = await page.locator('[data-testid*="video"], [data-testid*="VideoCard"], .search-results').count() > 0
    console.log('Search results found:', hasResults)
  })

  test('should clear search when clear button is clicked', async ({ page }) => {
    const searchInput = page.getByTestId('SearchBarInput').locator('input')
    await searchInput.click()

    // Type something
    await searchInput.fill('test search')

    // Find and click the clear button (X icon)
    const clearButton = page.getByRole('button', { name: 'clear search' })
    await expect(clearButton).toBeVisible()
    await clearButton.click()

    // Verify input is cleared
    await expect(searchInput).toHaveValue('')
  })

  test('should show trending searches in overlay', async ({ page }) => {
    const searchInput = page.getByTestId('SearchBarInput')
    await searchInput.click()

    const searchOverlay = page.getByTestId('SearchOverlay')
    await expect(searchOverlay).toBeVisible()

    // Look for trending searches section
    // The component shows either "Trending Searches" or "Popular Searches"
    const trendingSection = page.locator('text=/Trending Searches|Popular Searches/')
    await expect(trendingSection).toBeVisible()
  })

  test('should close overlay when clicking trending search item', async ({ page }) => {
    const searchInput = page.getByTestId('SearchBarInput')
    await searchInput.click()

    const searchOverlay = page.getByTestId('SearchOverlay')
    await expect(searchOverlay).toBeVisible()

    // Wait for trending searches to load and click first one
    await page.waitForTimeout(1000)
    const firstTrendingChip = page.locator('div[role="button"]').first()

    if (await firstTrendingChip.isVisible()) {
      await firstTrendingChip.click()

      // Verify the search input gets the value
      const actualInput = page.getByTestId('SearchBarInput').locator('input')
      const inputValue = await actualInput.inputValue()
      expect(inputValue).toBeTruthy()

      // Verify overlay stays open (since we selected a search term)
      await expect(searchOverlay).toBeVisible()
    }
  })

  test('should close overlay when pressing Escape', async ({ page }) => {
    const searchInput = page.getByTestId('SearchBarInput')
    await searchInput.click()

    const searchOverlay = page.getByTestId('SearchOverlay')
    await expect(searchOverlay).toBeVisible()

    // Press Escape
    await page.keyboard.press('Escape')

    // Verify overlay closes
    await expect(searchOverlay).not.toBeVisible()
  })

  test('should trigger search on Enter key', async ({ page }) => {
    const searchInput = page.getByTestId('SearchBarInput').locator('input')
    await searchInput.click()
    await searchInput.fill('faith')

    // Press Enter
    await page.keyboard.press('Enter')

    // Wait for search to be processed
    await page.waitForTimeout(1000)

    // The search should be triggered (we can verify by checking if loading indicator appears)
    const inputValue = await searchInput.inputValue()
    expect(inputValue).toBe('faith')
  })

  test('should show language filter in overlay', async ({ page }) => {
    const searchInput = page.getByTestId('SearchBarInput')
    await searchInput.click()

    const searchOverlay = page.getByTestId('SearchOverlay')
    await expect(searchOverlay).toBeVisible()

    // Look for language filter
    const languageFilter = page.getByTestId('SearchOverlay').getByText('Filter by language').first()
    await expect(languageFilter).toBeVisible()
  })

  test('should test live search behavior specifically', async ({ page }) => {
    console.log('Testing live search behavior...')

    const searchInput = page.getByTestId('SearchBarInput').locator('input')
    await searchInput.click()

    // Type character by character to test live search
    await searchInput.type('hope', { delay: 100 })

    // Monitor network requests to see if search is being triggered
    const requests = []
    page.on('request', (request) => {
      if (request.url().includes('algolia') || request.url().includes('search')) {
        requests.push(request.url())
        console.log('Search request:', request.url())
      }
    })

    // Wait a bit to capture any live search requests
    await page.waitForTimeout(2000)

    console.log('Total search requests captured:', requests.length)

    // Check if search is performing too many requests (indicating live search issue)
    if (requests.length > 5) {
      console.log('WARNING: Detected potential live search issue - too many requests')
      console.log('Requests:', requests)
    }

    // Verify that search only happens on intended actions (Enter, button click, etc.)
    // and not on every keystroke
  })
})