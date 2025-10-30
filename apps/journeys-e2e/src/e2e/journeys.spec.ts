import { expect, test } from '@playwright/test'

/* 
Test a journey by following the journey's selection buttons
*/
test('journeys', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  // Wait for and click the Fact or Fiction entry using a stable href-based locator
  const factOrFictionLink = page.locator('a[href="/fact-or-fiction"]')
  await expect(factOrFictionLink).toBeVisible({ timeout: 150000 })
  // Click and handle potential new-tab navigation; fall back to same-page navigation
  const newPageWait = page.context()
    .waitForEvent('page', { timeout: 5000 })
    .catch(() => null)
  await factOrFictionLink.click()
  const newPage = await newPageWait
  const targetPage = newPage ?? page
  if (newPage) {
    await newPage.waitForLoadState('domcontentloaded')
  }
  // test that user actually navigated to the choosen journey
  await expect(targetPage).toHaveURL(/.*fact-or-fiction/)
  // Test Fact or Fiction screen
  await expect(
    page
      .getByRole('heading', { name: 'Fact or Fiction' })
      .and(page.getByTestId('JourneysTypography'))
  ).toBeInViewport()
  await page.getByRole('button', { name: 'Explore Now' }).click()
  // Test Video Screen
  await page.getByTestId('ConductorNavigationButtonNext').click()
  // Test Can we trust the story of Jesus? screen
  await expect(
    page.getByText('Can we trust the story of Jesus?')
  ).toBeInViewport()
  await page.getByText('Yes, it’s a true story 👍').click()
  // Test Video Screen
  await page.getByTestId('JourneysVideoControls').click()
  await page.getByTestId('ConductorNavigationButtonNext').click()
  // Test Jesus in History screen
  await expect(page.getByText('Jesus in History')).toBeInViewport()
  await page.getByText('One question remains', { exact: false }).click()
  // Test Who was this Jesus? screen
  await expect(page.getByText('Who was this Jesus?')).toBeInViewport()
  await page.getByText('The Son of God').click()
  // Test navigation to next journey
  await expect(page).toHaveURL(/.*what-about-the-resurrection/)
})
