/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'

import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'

test.describe('Verify analytics page functionality', () => {
  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.login()
  })

  // Verify the user able to navigate to Journey analytics page through analytics icon
  test('navigate to Journey analytics', async ({ page, context }) => {
    const journeyPage = new JourneyPage(page)
    await journeyPage.setBrowserContext(context)
    await journeyPage.clickCreateCustomJourney() // click create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // craeting custom journey and verifying that created journey in active tab list
    const journeyName = await journeyPage.getJourneyName()
    await journeyPage.selectCreatedJourney(journeyName) // selecting created journey
    await journeyPage.verifyAnalyticsPageNavigation() // verifing it's navigated to analytics page
  })
})
