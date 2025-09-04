import { expect, test } from '@playwright/test'

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/watch')
  })

  test('should display search box and accept input', async ({ page }) => {
    const searchBox = page.locator('input[aria-label="Search videos, films, and series"]').first()
    await expect(searchBox).toBeVisible()
    await expect(searchBox).toHaveAttribute('placeholder', 'Search videos, films, and series...')

    await searchBox.fill('Jesus')
    await expect(searchBox).toHaveValue('Jesus')
  })

  test('should handle submit functionality', async ({ page }) => {
    const searchBox = page.locator('input[aria-label="Search videos, films, and series"]').first()
    const submitButton = page.locator('button[aria-label="Submit search"]').first()

    await searchBox.fill('Jesus')

    // Click submit button
    await submitButton.click()

    // In Phase 1, submit doesn't trigger search yet, but the input should remain
    await expect(searchBox).toHaveValue('Jesus')
    console.log('Submit button clicked successfully')
  })

  test('should render page content', async ({ page }) => {
    // Check that the main videos section exists
    const videosSection = page.locator('[id="videos"]').first()
    await expect(videosSection).toBeVisible()

    // Check that search bar is present
    const searchBox = page.locator('input[aria-label="Search videos, films, and series"]').first()
    await expect(searchBox).toBeVisible()
  })

  test('should handle multiple input terms', async ({ page }) => {
    const searchBox = page.locator('input[aria-label="Search videos, films, and series"]').first()
    const testTerms = ['Jesus', 'love', 'gospel', 'hope', 'faith']

    for (const term of testTerms) {
      await searchBox.fill(term)
      await expect(searchBox).toHaveValue(term)
      console.log(`Input accepted: "${term}"`)
    }
  })



  test('should handle edge cases gracefully', async ({ page }) => {
    const searchBox = page.locator('input[aria-label="Search videos, films, and series"]').first()
    const edgeCases = [
      { input: '', description: 'Empty input' },
      { input: 'a', description: 'Single character' },
      { input: 'Jesus Christ love gospel salvation redemption hope faith', description: 'Long input term' },
      { input: '   Jesus   ', description: 'Input with spaces' },
      { input: 'JESUS', description: 'Uppercase input' }
    ]

    for (const testCase of edgeCases) {
      await searchBox.fill(testCase.input)
      await expect(searchBox).toHaveValue(testCase.input)
      console.log(`${testCase.description}: "${testCase.input}" accepted`)
    }
  })

  test('should maintain input across viewport changes', async ({ page }) => {
    const searchBox = page.locator('input[aria-label="Search videos, films, and series"]').first()
    await searchBox.fill('Jesus')
    await expect(searchBox).toHaveValue('Jesus')

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(1000)
    await expect(searchBox).toHaveValue('Jesus')

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)
    await expect(searchBox).toHaveValue('Jesus')

    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('should handle keyboard interactions', async ({ page }) => {
    const searchBox = page.locator('input[aria-label="Search videos, films, and series"]').first()

    // Test Enter key
    await searchBox.fill('Jesus')
    await searchBox.press('Enter')
    await expect(searchBox).toHaveValue('Jesus')

    // Test Escape key clears input
    await searchBox.press('Escape')
    await expect(searchBox).toHaveValue('')
  })

  test('should allow clearing input', async ({ page }) => {
    const searchBox = page.locator('input[aria-label="Search videos, films, and series"]').first()
    const clearButton = page.locator('button[aria-label="Clear search"]').first()

    // Fill input
    await searchBox.fill('Jesus')
    await expect(searchBox).toHaveValue('Jesus')
    await expect(clearButton).toBeVisible()

    // Clear using button
    await clearButton.click()
    await expect(searchBox).toHaveValue('')
    await expect(clearButton).not.toBeVisible()
  })
})
