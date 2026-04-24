import { expect, test } from '@playwright/test'

/*
Test a journey by following the journey's selection buttons
(runs on chrome-desktop only — see playwright.config.ts)
*/
test('journeys', async ({ page }) => {
  test.setTimeout(120000)
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  // Wait for and click the Fact or Fiction entry using a stable href-based locator
  const factOrFictionLink = page.locator('a[href="/fact-or-fiction"]')
  // 90s: cold Vercel SSR for journeys home can exceed the default Playwright timeout
  await expect(factOrFictionLink).toBeVisible({ timeout: 90000 })
  // Click and handle potential new-tab navigation; fall back to same-page navigation
  const newPageWait = page
    .context()
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
  const factHeading = targetPage
    .getByRole('heading', { name: 'Fact or Fiction' })
    .and(targetPage.getByTestId('JourneysTypography'))
  await factHeading.scrollIntoViewIfNeeded()
  await expect(factHeading).toBeVisible()
  await targetPage.getByRole('button', { name: 'Explore Now' }).click()
  await expect(
    targetPage.getByRole('region', { name: 'Video Player' })
  ).toBeVisible({ timeout: 90000 })
  // While a journey video step is playing, VideoControls clears showNavigation, so the
  // conductor chevron stays faded out; ArrowRight uses HotkeyNavigation and still advances.
  await expect(
    targetPage.getByTestId('ConductorNavigationButtonNext')
  ).toBeAttached({ timeout: 90000 })
  const yesTrust = targetPage
    .getByText('Yes, it’s a true story 👍')
    .filter({ visible: true })
  for (let attempt = 0; attempt < 10; attempt++) {
    if (await yesTrust.isVisible()) break
    await targetPage.keyboard.press('ArrowRight')
    await targetPage.waitForTimeout(400)
  }
  await expect(yesTrust).toBeVisible({ timeout: 30000 })
  await yesTrust.click()
  // Test Video Screen
  await targetPage.getByTestId('JourneysVideoControls').click()
  await expect(
    targetPage.getByTestId('ConductorNavigationButtonNext')
  ).toBeAttached({ timeout: 90000 })
  await targetPage.keyboard.press('ArrowRight')
  // Test Jesus in History screen
  const historyHeading = targetPage
    .getByText('Jesus in History')
    .filter({ visible: true })
  await expect(historyHeading).toBeVisible({ timeout: 30000 })
  await targetPage
    .getByText('One question remains', { exact: false })
    .filter({ visible: true })
    .click()
  // Test Who was this Jesus? screen
  const whoHeading = targetPage
    .getByText('Who was this Jesus?')
    .filter({ visible: true })
  await expect(whoHeading).toBeVisible({ timeout: 30000 })
  await targetPage.getByText('The Son of God').filter({ visible: true }).click()
  // Test navigation to next journey
  await expect(targetPage).toHaveURL(/.*what-about-the-resurrection/)
})
