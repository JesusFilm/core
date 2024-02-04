import { expect, test } from '@playwright/test'

import { LandingPage } from '../pages/landing-page'

/* 
This is just a sample test
Test that 'journeys-admin' part of the URL
*/
test('sample journeys-admin e2e test', async ({ page }) => {
  const landingPage = new LandingPage(page)
  await landingPage.goToAdminUrl()

  // Get and log the current URL
  const url = page.url()
  console.log('Current URL:', url)

  await expect(page).toHaveScreenshot('home-page.png', {
    animations: 'disabled',
    fullPage: true
  })
})
