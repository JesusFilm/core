/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'

import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'

test.describe('verify see link and see all templates', () => {
  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.login()
  })

  // Assert that See all link & See all templates button have a href to /templates
  test('Assert that See all link & See all templates button have a href to /templates', async ({
    page
  }) => {
    const journeyPage = new JourneyPage(page)
    await journeyPage.verifySeeLinkHrefAttributeBesideUseTemplate() // beside the 'use template' drawer name in discover page, verify the 'see link' have href attribute with '/templates' value
    await journeyPage.verifySeeAllTemplateBelowUseTemplate() // at the bottom of  the 'use template' drawer, verify the 'See all templates' have href attribute with '/templates' value
  })
})
