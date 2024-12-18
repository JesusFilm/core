/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'

import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'
import { Register } from '../../pages/register-Page'
import { TeamsPage } from '../../pages/teams-page'

let userEmail = ''

test.describe('Verify Add member', () => {
  test.beforeAll('Register new account', async ({ browser }) => {
    const page = await browser.newPage()
    const teamsPage = new TeamsPage(page)
    const landingPage = new LandingPage(page)
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
    await landingPage.goToAdminUrl()
    await loginPage.logInWithCreatedNewUser(userEmail) // login as registered user
  })

  // Verify the user able to add the member through member option in discover page
  test('Add a member through member option in discover page', async ({
    page
  }) => {
    const teamsPage = new TeamsPage(page)
    await teamsPage.verifyMemberAddedViaMemberOptionOfThreeDotOptions()
  })

  // Verify the user able to add the member through + icon in discover page
  test('Add the member through + icon in discover page', async ({ page }) => {
    const teamsPage = new TeamsPage(page)
    await teamsPage.verifyMemberAddedViaPlusIconAtTopOfTheRightCorner()
  })
})
