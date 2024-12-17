/* eslint-disable playwright/no-skipped-test */
/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'

import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'
import { Register } from '../../pages/register-Page'
import { TeamsPage } from '../../pages/teams-page'

let userEmail = ''

test.describe('Verify user able to Active, Archived, Trash the journeys', () => {
  // Issue 1 : In Terms and Conditions page,The 'Next' button is not working properly
  // Issue 2 : The error toast message is displaying after registration new account
  test.beforeAll('Register new account', async ({ browser }) => {
    const page = await browser.newPage()
    const landingPage = new LandingPage(page)
    const teamsPage = new TeamsPage(page)
    const register = new Register(page)
    await landingPage.goToAdminUrl()
    await register.registerNewAccount() // registering new user account
    userEmail = await register.getUserEmailId() // storing the registered user email id
    await teamsPage.createNewTeamAndVerifyCreatedTeam() // create new team and verify the created team
    console.log(`userName : ${userEmail}`)
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    const journeyPage = new JourneyPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.logInWithCreatedNewUser(userEmail) // login as registered user
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
  })

  test('Verify the user able to move the single journeys from Active, archived, Trash page', async ({
    page
  }) => {
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

  test('Verify the user able to move the all journeys from Active, archived, Trash page', async ({
    page
  }) => {
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
