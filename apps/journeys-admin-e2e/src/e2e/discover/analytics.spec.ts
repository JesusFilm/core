/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'
import type { BrowserContext, Page } from 'playwright-core'

import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { Register } from '../../pages/register-Page'

let userEmail = ''
let sharedPage: Page | undefined
let sharedContext: BrowserContext | undefined

const getSharedPage = (): Page => {
  if (sharedPage == null)
    throw new Error('Shared authenticated page was not initialized')
  return sharedPage
}

const getSharedContext = (): BrowserContext => {
  if (sharedContext == null) {
    throw new Error('Shared authenticated context was not initialized')
  }
  return sharedContext
}

test.describe('Verify analytics page functionality', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll('Register new account', async ({ browser }) => {
    sharedContext = await browser.newContext()
    sharedPage = await sharedContext.newPage()
    const landingPage = new LandingPage(sharedPage)
    const register = new Register(sharedPage)
    await landingPage.goToAdminUrl()
    await register.registerNewAccount() // registering new user account
    userEmail = await register.getUserEmailId() // storing the registered user email id
    console.log(`userName : ${userEmail}`)
  })

  test.beforeEach(async () => {
    await getSharedPage().goto('/')
  })

  test.afterAll(async () => {
    if (sharedPage != null) await sharedPage.close()
    if (sharedContext != null) await sharedContext.close()
    sharedPage = undefined
    sharedContext = undefined
  })

  // Verify the user able to navigate to Journey analytics page through analytics icon
  test('navigate to Journey analytics', async () => {
    const page = getSharedPage()
    const context = getSharedContext()
    const journeyPage = new JourneyPage(page)
    await journeyPage.setBrowserContext(context)
    await journeyPage.clickCreateCustomJourney() // click create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // craeting custom journey and verifying that created journey in active tab list
    await journeyPage.selectExistingJourney() // selecting existing journey
    await journeyPage.clickAnalyticsIconInCustomJourneyPage() // clicking on analytics icon in custom journey page
    await journeyPage.verifyAnalyticsPageNavigation() // verifing it's navigated to analytics page
  })
})
