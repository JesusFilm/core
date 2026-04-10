import { type Page, expect, test } from '@playwright/test'

/**
 * Conductor next lives inside a Fade tied to `showNavigation`. VideoControls clears it while
 * the video plays with inactive UI. On mobile, `onTouchEnd` calls `player.userActive(true)` —
 * Playwright `click()` often synthesizes mouse only, so CI misses that path. We `tap()` the
 * controls region, then fire `mouseover` on the nav zone (same as desktop hover in app code).
 */
async function tapVideoControlsAndClickConductorNext(
  targetPage: Page
): Promise<void> {
  const videoControls = targetPage.getByRole('region', {
    name: 'video-controls'
  })
  await expect(videoControls).toBeVisible()
  await videoControls.tap()
  await targetPage
    .getByTestId('ConductorNavigationContainerNext')
    .dispatchEvent('mouseover')
  const nextBtn = targetPage.getByTestId('ConductorNavigationButtonNext')
  await expect(nextBtn).toBeVisible({ timeout: 20000 })
  await nextBtn.click()
}

/* 
Test a journey by following the journey's selection buttons
*/
test('journeys', async ({ page }) => {
  // Default project timeout is 60s; cold homepage + full journey can exceed it.
  test.setTimeout(120000)

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  // Wait for and click the Fact or Fiction entry using a stable href-based locator
  const factOrFictionLink = page.locator('a[href="/fact-or-fiction"]')
  // 90s: cold SSR / hydration; must stay below test.setTimeout with room for the rest of the journey
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
  await expect(
    targetPage
      .getByRole('heading', { name: 'Fact or Fiction' })
      .and(targetPage.getByTestId('JourneysTypography'))
  ).toBeInViewport()
  await targetPage.getByRole('button', { name: 'Explore Now' }).click()
  // Test Video Screen
  await tapVideoControlsAndClickConductorNext(targetPage)
  // Test Can we trust the story of Jesus? screen
  await expect(
    targetPage.getByText('Can we trust the story of Jesus?')
  ).toBeInViewport()
  await targetPage.getByText('Yes, it’s a true story 👍').click()
  // Test Video Screen
  await tapVideoControlsAndClickConductorNext(targetPage)
  // Test Jesus in History screen
  await expect(targetPage.getByText('Jesus in History')).toBeInViewport()
  await targetPage.getByText('One question remains', { exact: false }).click()
  // Test Who was this Jesus? screen
  await expect(targetPage.getByText('Who was this Jesus?')).toBeInViewport()
  await targetPage.getByText('The Son of God').click()
  // Test navigation to next journey
  await expect(targetPage).toHaveURL(/.*what-about-the-resurrection/)
})
