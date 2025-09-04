import { expect, test } from '@playwright/test'

test.describe('Search suggestions + grid overlays', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/watch')
  })

  test('clear shows Popular searches and removes previous highlights', async ({ page }) => {
    const input = page.getByTestId('search-input')
    await input.click()
    await input.fill('jesus')

    // Wait for suggestions panel to appear and show highlights for typed query
    const panel = page.getByTestId('suggestions-panel')
    await expect(panel).toBeVisible()

    // When typing, highlighted <mark> elements should be present
    const highlighted = panel.locator('mark')
    const highlightedCount = await highlighted.count()
    expect(highlightedCount).toBeGreaterThan(0)

    // Click clear (X) and expect Popular searches header, with no highlights
    const clear = page.getByTestId('clear-button')
    await clear.click()

    await expect(panel).toBeVisible()
    await expect(panel.getByText('Popular searches')).toBeVisible()
    // No highlights when showing popular (empty query)
    await expect(panel.locator('mark')).toHaveCount(0)
  })

  test('Hits remain mounted; skeleton overlays during loading', async ({ page }) => {
    const input = page.getByTestId('search-input')
    await input.click()
    await input.fill('jesus')

    // Submit search via button
    await page.getByLabel('Submit search').click()

    // Skeleton overlay should appear, but hits grid container should remain in the DOM
    const skeleton = page.getByTestId('grid-skeleton-overlay')
    await expect(skeleton).toBeVisible()

    const hitsContainer = page.getByTestId('hits-grid-container')
    await expect(hitsContainer).toBeVisible()

    // Wait for loading to finish and grid to become visible again
    await skeleton.waitFor({ state: 'detached', timeout: 10000 }).catch(async () => {
      // If skeleton remains (slow network), fall back to waiting for it to be hidden
      await expect(skeleton).toBeHidden()
    })
    await expect(hitsContainer).toBeVisible()
  })
})
