import { expect, test } from '@playwright/test'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'
import { TeamsPage } from '../../pages/teams-page'

test.describe('Verify Add member', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    const landingPage = new LandingPage(page)
    const teamsPage = new TeamsPage(page)
    const loginPage = new LoginPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.login()
    await teamsPage.createNewTeamAndVerifyCreatedTeam() // create new team and verify the created team
    await page.close()
  })
  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.login()
  })
  //Verify the user able to add the member through member option in discover page
  test('Add a member through member option in discover page', async ({
    page
  }) => {
    const teamsPage = new TeamsPage(page)
    await teamsPage.verifyMemberAddedViaMemberOptionOfThreeDotOptions()
  })
  //Verify the user able to add the member through + icon in discover page
  test('Add the member through + icon in discover page', async ({ page }) => {
    const teamsPage = new TeamsPage(page)
    await teamsPage.verifyMemberAddedViaPlusIconAtTopOfTheRightCorner()
  })
})
