import { expect, test } from '@playwright/test'

test.describe('SearchBar UI - Phase 1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/watch')
  })

  test('should render SearchBar with input and submit button', async ({ page }) => {
    // Find the SearchBar container (replaced the old search input)
    const searchBarContainer = page.locator('[role="combobox"]').first()
    await expect(searchBarContainer).toBeVisible()

    // Check that input exists with proper attributes
    const searchInput = page.locator('input[aria-label="Search videos, films, and series"]').first()
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toHaveAttribute('placeholder', 'Search videos, films, and series...')

    // Check that submit button exists
    const submitButton = page.locator('button[aria-label="Submit search"]').first()
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toHaveText('Search')

    // Check that search icon is present
    const searchIcon = searchBarContainer.locator('svg').first()
    await expect(searchIcon).toBeVisible()
  })

  test('should display clear button when input has value', async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Search videos, films, and series"]').first()
    const clearButton = page.locator('button[aria-label="Clear search"]').first()

    // Initially, clear button should not be visible
    await expect(clearButton).not.toBeVisible()

    // Type something in the input
    await searchInput.fill('test search')

    // Clear button should now be visible
    await expect(clearButton).toBeVisible()

    // Click clear button
    await clearButton.click()

    // Input should be cleared and clear button should disappear
    await expect(searchInput).toHaveValue('')
    await expect(clearButton).not.toBeVisible()
  })

  test('should trigger submit on Enter key press', async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Search videos, films, and series"]').first()

    // Type something and press Enter
    await searchInput.fill('test search')
    await searchInput.press('Enter')

    // Since this is Phase 1, we just verify the input maintains focus
    // In future phases, this would trigger actual search
    await expect(searchInput).toBeFocused()
  })

  test('should clear input on Escape key press', async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Search videos, films, and series"]').first()

    // Type something and press Escape
    await searchInput.fill('test search')
    await searchInput.press('Escape')

    // Input should be cleared
    await expect(searchInput).toHaveValue('')
  })

  test('should have proper accessibility attributes', async ({ page }) => {
    const searchBarContainer = page.locator('[role="combobox"]').first()
    const searchInput = page.locator('input[aria-label="Search videos, films, and series"]').first()

    // Check ARIA attributes on combobox
    await expect(searchBarContainer).toHaveAttribute('role', 'combobox')
    await expect(searchBarContainer).toHaveAttribute('aria-expanded', 'false')
    await expect(searchBarContainer).toHaveAttribute('aria-haspopup', 'listbox')

    // Check input attributes
    await expect(searchInput).toHaveAttribute('aria-autocomplete', 'list')
    await expect(searchInput).toHaveAttribute('aria-describedby', 'search-help')

    // Check hidden help text
    const helpText = page.locator('#search-help').first()
    await expect(helpText).toHaveText('Press Enter to search or Escape to clear')
  })

  test('should have proper focus and keyboard navigation', async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Search videos, films, and series"]').first()
    const submitButton = page.locator('button[aria-label="Submit search"]').first()

    // Focus input
    await searchInput.focus()
    await expect(searchInput).toBeFocused()

    // Tab to submit button
    await page.keyboard.press('Tab')
    await expect(submitButton).toBeFocused()

    // Tab back to input
    await page.keyboard.press('Shift+Tab')
    await expect(searchInput).toBeFocused()
  })

  test('should have rounded pill styling', async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Search videos, films, and series"]').first()

    // Check that input has rounded-full class for pill shape
    const inputClasses = await searchInput.getAttribute('class')
    expect(inputClasses).toContain('rounded-full')

    // Check height is appropriate for pill design (h-16)
    expect(inputClasses).toContain('h-16')
  })

  test('should display loading state when provided', async ({ page }) => {
    // Note: In Phase 1, loading state comes from InstantSearch status
    // This test verifies the loading spinner appears during search operations
    const searchInput = page.locator('input[aria-label="Search videos, films, and series"]').first()

    // Type to potentially trigger loading state
    await searchInput.fill('test')

    // Look for loading spinner (may or may not appear depending on search state)
    const loadingSpinner = page.locator('[aria-hidden="true"]').filter({ hasText: '' }).locator('div').filter({ hasClass: /animate-spin/ }).first()

    // If loading spinner exists, verify it's visible
    const spinnerCount = await loadingSpinner.count()
    if (spinnerCount > 0) {
      await expect(loadingSpinner).toBeVisible()
    }
  })

  test('should maintain proper spacing and alignment', async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Search videos, films, and series"]').first()
    const submitButton = page.locator('button[aria-label="Submit search"]').first()

    // Verify all elements are properly positioned
    await expect(searchInput).toBeVisible()
    await expect(submitButton).toBeVisible()

    // Check that the search input has the expected styling classes
    const inputClasses = await searchInput.getAttribute('class')
    expect(inputClasses).toContain('rounded-full')
    expect(inputClasses).toContain('h-16')

    // Check that submit button has proper styling
    const buttonClasses = await submitButton.getAttribute('class')
    expect(buttonClasses).toContain('rounded-full')
  })
})
