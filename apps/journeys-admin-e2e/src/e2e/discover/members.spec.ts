/* eslint-disable playwright/expect-expect */
import type { BrowserContext, Page } from 'playwright-core'

import { test } from '../../fixtures/workerAuth'
import { LandingPage } from '../../pages/landing-page'
import { TeamsPage } from '../../pages/teams-page'

let sharedPage: Page | undefined
let sharedContext: BrowserContext | undefined

const getSharedPage = (): Page => {
  if (sharedPage == null)
    throw new Error('Shared authenticated page was not initialized')
  return sharedPage
}

test.describe('Verify Add member', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll('Register new account', async ({ browser, workerStorageState }) => {
    sharedContext = await browser.newContext({ storageState: workerStorageState })
    sharedPage = await sharedContext.newPage()
    const landingPage = new LandingPage(sharedPage)
    const teamsPage = new TeamsPage(sharedPage)
    await landingPage.goToAdminUrl()
    await teamsPage.createNewTeamAndVerifyCreatedTeam() // create new team and verify the created team
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
  test('Add a member through member option in discover page', async ({}) => {
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
