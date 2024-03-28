import { expect, test } from '@playwright/test'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'
import { JourneyPage } from '../../pages/journey-page'
import { TeamsPage } from '../../pages/teams-page'

test.describe('Teams', () => {
  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.login()
  })

  /*
1. Create a new team
2. Create a journey (just one card) for newly created team
3. Rename the team
*/
  test('Create a team and create a journey then rename the team', async ({
    page
  }) => {
    const teamsPage = new TeamsPage(page)
    const journeyName = new JourneyPage(page)

    await teamsPage.createNewTeamAndVerifyCreatedTeam()
    await journeyName.setJourneyName('firstJourneyName')
    await teamsPage.clickCreateJourneyBtn()
    await journeyName.createAndVerifyCustomJourney()
    await teamsPage.verifyCreatedTeamRenamed()
  })
})
