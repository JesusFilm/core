import { expect, test } from '@playwright/test'

/* 
Test a journey by following the journey's selection buttons
*/
test('journeys', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  // Wait for and click the Fact or Fiction entry using robust role-based locator
  const factOrFictionLink = page.getByRole('link', { name: 'Fact or Fiction' })
  await expect(factOrFictionLink).toBeVisible({ timeout: 60000 })
  await factOrFictionLink.click()
  // test that user actually navigated to the choosen journey
  await expect(page).toHaveURL(/.*fact-or-fiction/)
  // Test Fact or Fiction screen
  await expect(
    page.getByRole('heading', { name: 'Fact or Fiction' })
  ).toBeInViewport()
  await expect(page.getByTestId('JourneysTypography')).toBeInViewport()
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
