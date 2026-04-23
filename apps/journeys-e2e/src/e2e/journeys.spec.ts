import { type Page, expect, test } from '@playwright/test'

/**
 * Next step in LTR: `HotkeyNavigation` maps ArrowRight to next. Chevrons stay
 * hidden without hover, and synthetic touch swipes are unreliable in Playwright mobile.
 */
async function pressConductorNext(page: Page): Promise<void> {
  await page.keyboard.press('ArrowRight')
}

/* 
Test a journey by following the journey's selection buttons
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
  // Path can stay `/` on some previews while the journey content loads from the slug.
  // 90s: cold Vercel preview SSR + hydration can delay the first journey paint (within the 90s hard cap).
  await expect(
    targetPage
      .getByRole('heading', { name: 'Fact or Fiction' })
      .and(targetPage.getByTestId('JourneysTypography'))
  ).toBeInViewport({ timeout: 90000 })
  await targetPage.getByRole('button', { name: 'Explore Now' }).click()
  // Test Video Screen
  await pressConductorNext(targetPage)
  // Test Can we trust the story of Jesus? screen
  await expect(
    targetPage.getByText('Can we trust the story of Jesus?')
  ).toBeVisible({
    timeout: 30000
  })
  await targetPage.getByText('Yes, it’s a true story 👍').click()
  // Test Video Screen
  await targetPage.getByTestId('JourneysVideoControls').click()
  await pressConductorNext(targetPage)
  // Test Jesus in History screen
  await expect(
    targetPage.getByRole('heading', { name: 'Jesus in History' })
  ).toBeVisible({ timeout: 30000 })
  await targetPage.getByText('One question remains', { exact: false }).click()
  // Test Who was this Jesus? screen
  await expect(
    targetPage.getByRole('heading', { name: 'Who was this Jesus?' })
  ).toBeVisible({ timeout: 30000 })
  await targetPage.getByText('The Son of God').click()
  await expect(targetPage).toHaveURL(/.*what-about-the-resurrection/, {
    timeout: 30000
  })
})
