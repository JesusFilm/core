/* eslint-disable playwright/expect-expect */
import type { BrowserContext, Page } from 'playwright-core'

import { test } from '../../fixtures/workerAuth'
import { JourneyPage } from '../../pages/journey-page'

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

  test.beforeAll('Register new account', async ({ browser, workerStorageState }) => {
    sharedContext = await browser.newContext({ storageState: workerStorageState })
    sharedPage = await sharedContext.newPage()
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
