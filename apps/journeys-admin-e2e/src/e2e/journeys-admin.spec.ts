import { test } from '@playwright/test'

import { LandingPage } from '../pages/landing-page'

/* 
This is just a sample test
Test that 'journeys-admin' part of the URL
*/
// eslint-disable-next-line playwright/expect-expect
test('journeys-admin landing page vr test', async ({ page }) => {
  const landingPage = new LandingPage(page)
  await landingPage.goToAdminUrl()

  // Get and log the current URL
  const url = page.url()
  console.log('Current URL:', url)

  // await expect(page).toHaveScreenshot('home-page.png', {
  //   animations: 'disabled',
  //   fullPage: true
  // })
})
