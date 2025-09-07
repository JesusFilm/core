import { expect, test } from '@playwright/test'

test.describe('Select Language Pill Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page with the search component
    await page.goto('/watch')

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle')
  })

  test('clicking "Select a language" pill opens the LanguageFilter dropdown', async ({ page }) => {
    // Focus the search input to show the overlay with language pills
    await page.click('[data-testid="search-input"]')

    // Wait for the search overlay to appear
    await page.waitForSelector('[data-testid="search-input"]', { state: 'visible' })

    // Wait for the language pills to be visible
    await page.waitForSelector('text=Filter by Language', { timeout: 10000 })

    // Find and click the "Select a language" pill
    const selectLanguagePill = page.locator('button').filter({ hasText: 'Select a language' })
    await expect(selectLanguagePill).toBeVisible()

    // Click the pill
    await selectLanguagePill.click()

    // Wait for the LanguageFilter dropdown to appear
    const languageFilterButton = page.locator('[aria-label="Open language filter"]')
    await expect(languageFilterButton).toBeVisible()

    // The dropdown should be open (we can check this by looking for the dropdown content)
    // Since the dropdown is positioned absolutely, we can check for its presence
    const dropdownContent = page.locator('.bg-background\\/95')
    await expect(dropdownContent).toBeVisible()

    console.log('✅ Select Language pill successfully opened the LanguageFilter dropdown')
  })

  test('LanguageFilter dropdown can be opened and closed', async ({ page }) => {
    // Focus the search input to show the overlay
    await page.click('[data-testid="search-input"]')

    // Wait for the language pills
    await page.waitForSelector('text=Filter by Language', { timeout: 10000 })

    // Click the "Select a language" pill
    const selectLanguagePill = page.locator('button').filter({ hasText: 'Select a language' })
    await selectLanguagePill.click()

    // Verify dropdown is open
    const dropdownContent = page.locator('.bg-background\\/95')
    await expect(dropdownContent).toBeVisible()

    // Click outside to close the dropdown
    await page.click('body')

    // Verify dropdown is closed
    await expect(dropdownContent).not.toBeVisible()

    console.log('✅ LanguageFilter dropdown can be opened and closed properly')
  })

  test('language filter button exists and is accessible', async ({ page }) => {
    // Focus the search input to show the overlay
    await page.click('[data-testid="search-input"]')

    // Wait for the overlay
    await page.waitForSelector('text=Filter by Language', { timeout: 10000 })

    // Check that the LanguageFilter component is rendered
    const languageFilterButton = page.locator('[aria-label="Open language filter"]')
    await expect(languageFilterButton).toBeVisible()

    // Check accessibility attributes
    await expect(languageFilterButton).toHaveAttribute('aria-haspopup', 'listbox')
    await expect(languageFilterButton).toHaveAttribute('aria-expanded', 'false')

    console.log('✅ LanguageFilter button is properly accessible')
  })
})

