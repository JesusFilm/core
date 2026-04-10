/* eslint-disable playwright/expect-expect */
import type { BrowserContext, Page } from 'playwright-core'

import {
  newContextWithWorkerStorageState,
  test
} from '../../fixtures/workerAuth'
import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'

let onboardingPage: Page | undefined
let sharedContext: BrowserContext | undefined

const getSharedPage = (): Page => {
  if (onboardingPage == null)
    throw new Error('Shared authenticated page was not initialized')
  return onboardingPage
}

test.describe('verify journey sorting', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(
    'Register new account',
    async ({ browser, workerStorageState }) => {
      sharedContext = await newContextWithWorkerStorageState(
        browser,
        workerStorageState
      )
    }
  )

  test.beforeEach(async () => {
    const context = sharedContext
    if (context == null)
      throw new Error('Shared authenticated context was not initialized')
    onboardingPage = await context.newPage()
    const page = getSharedPage()
    const landingPage = new LandingPage(page)
    const journeyPage = new JourneyPage(page)
    await landingPage.goToAdminUrl()
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
  })

  test.afterEach(async () => {
    if (onboardingPage != null) {
      await onboardingPage.close()
      onboardingPage = undefined
    }
  })

  test.afterAll(async () => {
    if (onboardingPage != null) await onboardingPage.close()
    if (sharedContext != null) await sharedContext.close()
    onboardingPage = undefined
    sharedContext = undefined
  })

  // Sort by date
  test('verify journeys are sort by name', async () => {
    const page = getSharedPage()
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyPage.clickSortByIcon() // clicking the sortby icon beside the three dot option in the tab list section
    await journeyPage.clickSortOpion('Name') // clicking name option of sortby option list
    await journeyPage.verifySelectedSortOptionInSortByIcon('Name') // verify the sortby button text updated according to selected sortby option
    await journeyPage.verifyJouyneysAreSortedByNames() // verify the journeys are sorted according to their names
    await journeyPage.verifyNewlyJouyneysAreSortedByNames() // verify the new journeys are sorted according to their names
  })

  // Sort by name
  test('verify journeys are sort by date', async () => {
    const page = getSharedPage()
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyPage.clickSortByIcon() // clicking the sortby icon beside the three dot option in the tab list section
    await journeyPage.clickSortOpion('Name') // clicking name option of sortby option list
    await journeyPage.verifySelectedSortOptionInSortByIcon('Name') // verify the sortby button text updated according to selected sortby option
    await journeyPage.clickSortByIcon() // clicking the sortby icon beside the three dot option in the tab list section
    await journeyPage.clickSortOpion('Date Created') // clicking 'date created' option of sortby option list
    await journeyPage.verifySelectedSortOptionInSortByIcon('Date Created') // verify the sortby button text updated according to selected sortby option
    await journeyPage.verifyJourneyAreSortedByDates() // verify the journeys are sorted according to their created dates
    await journeyPage.verifyNewlyJourneyAreSortedByDates() // verify the new journeys are sorted according to their created dates
  })
})
