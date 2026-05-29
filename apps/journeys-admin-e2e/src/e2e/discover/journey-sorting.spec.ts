/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'

import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'

test.describe('verify journey sorting', () => {
  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    const journeyPage = new JourneyPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.login()
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
  })

  // Sort by date
  test('verify journeys are sort by name', async ({ page }) => {
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
  test('verify journeys are sort by date', async ({ page }) => {
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
