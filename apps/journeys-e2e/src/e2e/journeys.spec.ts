import { expect, test } from '@playwright/test'

/* 
Test a journey by following the journey's selection buttons
*/
test.fixme('journeys', async ({ page }) => {
  // TO Run Tests Everyday
  await page.goto('/')
  // fact or fiction page - click on on fact or fiction
  await page.click('a[href="/fact-or-fiction"]')
  // test that user actually navigated to the choosen journey
  await expect(page).toHaveURL(/.*fact-or-fiction/)
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
  // await expect(page).toHaveScreenshot('can-we-trust.png', {
  //   animations: 'disabled',
  //   fullPage: true
  // })
  await page.getByText('Yes, it’s a true story 👍').click()
  // Test Video Screen
  await page.getByTestId('JourneysVideoControls').click()
  await page.getByTestId('ConductorNavigationButtonNext').click()
  // Test Jesus in History screen
  await expect(page.getByText('Jesus in History')).toBeInViewport()
  // await expect(page).toHaveScreenshot('jesus-history.png', {
  //   animations: 'disabled',
  //   fullPage: true
  // })
  await page.getByText('One question remains', { exact: false }).click()
  // Test Who was this Jesus? screen
  await expect(page.getByText('Who was this Jesus?')).toBeInViewport()
  // await expect(page).toHaveScreenshot('who-was-jesus.png', {
  //   animations: 'disabled',
  //   fullPage: true
  // })
  await page.getByText('The Son of God').click()
  // Test navigation to next journey
  await expect(page).toHaveURL(/.*what-about-the-resurrection/)
})
