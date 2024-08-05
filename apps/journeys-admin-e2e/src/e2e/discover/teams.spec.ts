/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'

import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'
import { Register } from '../../pages/register-Page'
import { TeamsPage } from '../../pages/teams-page'

let userEmail = ''

test.describe('Teams', () => {
  test.beforeAll('Register new account', async ({ browser }) => {
    const page = await browser.newPage()
    const landingPage = new LandingPage(page)
    const register = new Register(page)
    await landingPage.goToAdminUrl()
    await register.registerNewAccount() // registering new user account
    userEmail = await register.getUserEmailId() // storing the registered user email id
    console.log('userName : ' + userEmail)
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.logInWithCreatedNewUser(userEmail) // login as registered user
  })

  /*
1. Create a new team
2. Create a journey (just one card) for newly created team
3. Rename the team
*/
  test.fixme(
    'Create a team and create a journey then rename the team',
    async ({ page }) => {
      test.setTimeout(120000)

      const teamsPage = new TeamsPage(page)
      const journeyName = new JourneyPage(page)
      // 1. Create a new team - Verify the user able to create the new team through New team option in menu icon in discover page
      await teamsPage.createNewTeamAndVerifyCreatedTeam()
      // 2. Create a journey (just one card) for newly created team - Newly created journeys for Newly created team are displayed
      await teamsPage.clickCreateJourneyBtn() // clicking create journey button in the center of the page for the new created team
      await journeyName.createAndVerifyCustomJourney()
      // 3. Rename the team (created team) - Verify the user able to rename the team through rename option in menu icon in discover page
      await teamsPage.verifyCreatedTeamRenamed()
    }
  )
})
