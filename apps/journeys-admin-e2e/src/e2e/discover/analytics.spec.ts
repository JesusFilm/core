/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'

import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'
import { Register } from '../../pages/register-Page'

let userEmail = ''

test.describe('Verify analytics page functionality', () => {
  test.beforeAll('Register new account', async ({ browser }) => {
    const page = await browser.newPage()
    const landingPage = new LandingPage(page)
    const register = new Register(page)
    await landingPage.goToAdminUrl()
    await register.registerNewAccount() // registering new user account
    userEmail = await register.getUserEmailId() // storing the registered user email id
    console.log(`userName : ${userEmail}`)
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.logInWithCreatedNewUser(userEmail) // login as registered user
  })

  // Verify the user able to navigate to Journey analytics page through analytics icon
  test('navigate to Journey analytics', async ({ page, context }) => {
    const journeyPage = new JourneyPage(page)
    await journeyPage.setBrowserContext(context)
    await journeyPage.clickCreateCustomJourney() // click create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // craeting custom journey and verifying that created journey in active tab list
    await journeyPage.selectExistingJourney() // selecting existing journey
    await journeyPage.clickAnalyticsIconInCustomJourneyPage() // clicking on analytics icon in custom journey page
    await journeyPage.verifyAnalyticsPageNavigation() // verifing it's navigated to analytics page
  })
})
