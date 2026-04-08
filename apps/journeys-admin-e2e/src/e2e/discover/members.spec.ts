/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'
import type { BrowserContext, Page } from 'playwright-core'

import { LandingPage } from '../../pages/landing-page'
import { Register } from '../../pages/register-Page'
import { TeamsPage } from '../../pages/teams-page'

let userEmail = ''
let sharedPage: Page | undefined
let sharedContext: BrowserContext | undefined

const getSharedPage = (): Page => {
  if (sharedPage == null) throw new Error('Shared authenticated page was not initialized')
  return sharedPage
}

test.describe('Verify Add member', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll('Register new account', async ({ browser }) => {
    sharedContext = await browser.newContext()
    sharedPage = await sharedContext.newPage()
    const teamsPage = new TeamsPage(sharedPage)
    const landingPage = new LandingPage(sharedPage)
    const register = new Register(sharedPage)
    await landingPage.goToAdminUrl()
    await register.registerNewAccount() // registering new user account
    userEmail = await register.getUserEmailId() // storing the registered user email id
    await teamsPage.createNewTeamAndVerifyCreatedTeam() // create new team and verify the created team
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

  // Verify the user able to add the member through member option in discover page
  test('Add a member through member option in discover page', async ({
    
  }) => {
    const page = getSharedPage()
    const teamsPage = new TeamsPage(page)
    await teamsPage.verifyMemberAddedViaMemberOptionOfThreeDotOptions()
  })

  // Verify the user able to add the member through + icon in discover page
  test('Add the member through + icon in discover page', async () => {
    const page = getSharedPage()
    const teamsPage = new TeamsPage(page)
    await teamsPage.verifyMemberAddedViaPlusIconAtTopOfTheRightCorner()
  })
})
