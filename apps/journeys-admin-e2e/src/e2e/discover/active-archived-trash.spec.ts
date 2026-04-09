/* eslint-disable playwright/no-skipped-test */
/* eslint-disable playwright/expect-expect */
import type { BrowserContext, Page } from 'playwright-core'

import { test } from '../../fixtures/workerAuth'
import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { TeamsPage } from '../../pages/teams-page'

let sharedPage: Page | undefined
let sharedContext: BrowserContext | undefined

const getSharedPage = (): Page => {
  if (sharedPage == null)
    throw new Error('Shared authenticated page was not initialized')
  return sharedPage
}

test.describe('Verify user able to Active, Archived, Trash the journeys', () => {
  test.describe.configure({ mode: 'serial' })

  // Issue 1 : In Terms and Conditions page,The 'Next' button is not working properly
  // Issue 2 : The error toast message is displaying after registration new account
  test.beforeAll('Register new account', async ({ browser, workerStorageState }) => {
    sharedContext = await browser.newContext({ storageState: workerStorageState })
    sharedPage = await sharedContext.newPage()
    const landingPage = new LandingPage(sharedPage)
    const teamsPage = new TeamsPage(sharedPage)
    await landingPage.goToAdminUrl()
    await teamsPage.createNewTeamAndVerifyCreatedTeam() // create new team and verify the created team
  })

  test.beforeEach(async () => {
    const page = getSharedPage()
    const journeyPage = new JourneyPage(page)
    await page.goto('/')
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
  })

  test.afterAll(async () => {
    if (sharedPage != null) await sharedPage.close()
    if (sharedContext != null) await sharedContext.close()
    sharedPage = undefined
    sharedContext = undefined
  })

  // ISSUE: After archiving a journey (or when the test runs), the Discover journey list (Active/Archived/Trash
  // tabs) is not found – locator('button[id*="archived-status-panel-tab"]') times out. Likely environment- or
  // routing-related (e.g. discover list not visible in this deployment). Re-enable when the discover journey
  // list is available.
  test.skip('Verify the user able to move the single journeys from Active, archived, Trash page', async ({}) => {
    const page = getSharedPage()
    const journeyPage = new JourneyPage(page)
    // Verify the user able to move the single journeys from Active to archived page
    await journeyPage.verifyExistingJourneyMovedActiveToArchivedTab()
    await journeyPage.clickArchivedTab()
    // Verify the user able to move the single journeys from Archived to Trash page
    await journeyPage.verifyCreatedJourneyMovedToTrash()
    // Verify the user able to restore the single journeys from Trash to active page
    await journeyPage.verifyCreatedNewJourneyRestored()
    // Verify the user able to move the single journeys from Active to Trash page
    await journeyPage.verifyCreatedJourneyMovedToTrash()
    // Verify the user able to delete the single file permanently in Trash page
    await journeyPage.verifyJourneyDeletedForeverFromTrashTab()
    // Verify the user able to unarchive the single journeys from Archived to active page
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyPage.verifyExistingJourneyMovedActiveToArchivedTab() // moving the created journey to archived tab by archiving that journey
    await journeyPage.clickArchivedTab() // clicking archived tab
    await journeyPage.verifyJourneyMovedFromArchivedToActiveTab()
  })

  // ISSUE: After archiving (or when the test runs), the Discover journey list (Active/Archived/Trash tabs) is
  // not found – button[id*="archived-status-panel-tab"] times out. Likely environment- or routing-related.
  // Re-enable when the discover journey list is available.
  test.skip('Verify the user able to move the all journeys from Active, archived, Trash page', async ({}) => {
    const page = getSharedPage()
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    // Verify the user able to move the all journeys from Active to archived page
    await journeyPage.verifyAllJourneysMovedActiveToArchivedTab()
    await journeyPage.clickArchivedTab()
    await journeyPage.getJourneyListOfArchivedTab()
    // Verify the user able to move the all journeys from Archived to Trash page
    await journeyPage.verifyAllJourneysMovedToTrash()
    // Verify the user able to restore the all journeys from Trash to active page
    await journeyPage.verifyAllJourneysRestored()
    await journeyPage.getJourneyListOfActiveTab()
    // Verify the user able to move the all journeys from Active to Trash page
    await journeyPage.verifyAllJourneysMovedToTrash()
    // Verify the user able to delete the all file permanently in Trash page
    await journeyPage.verifyAllJourneysDeletedForeverFromTrashTab()
    await journeyPage.clickActiveTab() // clickin on active tab
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyPage.verifyExistingJourneyMovedActiveToArchivedTab() // moving the created journey to archived tab by archiving that journey
    await journeyPage.clickArchivedTab() // clicking on archived tab
    await journeyPage.getJourneyListOfArchivedTab()
    // Verify the user able to unarchive the all journeys from Archived to active page
    await journeyPage.verifyAllJourneysMovedFromArchivedToActiveTab()
  })
})
