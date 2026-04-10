/* eslint-disable playwright/expect-expect */
import type { BrowserContext, Page } from 'playwright-core'

import {
  newContextWithWorkerStorageState,
  test
} from '../../fixtures/workerAuth'
import { JourneyLevelActions } from '../../pages/journey-level-actions-page'
import { JourneyPage } from '../../pages/journey-page'
import { TeamsPage } from '../../pages/teams-page'

let currentPage: Page | undefined
let sharedContext: BrowserContext | undefined

const getSharedPage = (): Page => {
  if (currentPage == null)
    throw new Error('Shared authenticated page was not initialized')
  return currentPage
}

const getSharedContext = (): BrowserContext => {
  if (sharedContext == null) {
    throw new Error('Shared authenticated context was not initialized')
  }
  return sharedContext
}

test.describe('Journey level actions - discover', () => {
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
    if (sharedContext == null) {
      throw new Error('Shared authenticated context was not initialized')
    }
    currentPage = await sharedContext.newPage()
    await new JourneyPage(getSharedPage()).gotoDiscoverJourneysPage()
  })

  test.afterEach(async () => {
    if (currentPage != null) {
      await currentPage.close()
      currentPage = undefined
    }
  })

  test.afterAll(async () => {
    if (currentPage != null) await currentPage.close()
    if (sharedContext != null) await sharedContext.close()
    currentPage = undefined
    sharedContext = undefined
  })

  test('Verify title option from three dot options on top right in the selected journey page', async () => {
    const page = getSharedPage()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney()
    await journeyPage.createAndVerifyCustomJourney()
    const journeyName = await journeyPage.getJourneyName()
    await journeyLevelActions.selectCreatedJourney(journeyName)
    await journeyPage.clickThreeDotBtnOfCustomJourney()
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Edit Details'
    )
    await journeyLevelActions.enterTitle()
    await journeyPage.clickSaveBtn()
    await journeyPage.backToHome()
    await journeyLevelActions.verifyJourneyRenamedInActiveList()
  })

  test('Verify description option from three dot options on top right in the selected journey page', async () => {
    const page = getSharedPage()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney()
    await journeyPage.createAndVerifyCustomJourney()
    const journeyName = await journeyPage.getJourneyName()
    await journeyLevelActions.selectCreatedJourney(journeyName)
    await journeyPage.clickThreeDotBtnOfCustomJourney()
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Edit Details'
    )
    await journeyLevelActions.enterDescription()
    await journeyPage.clickSaveBtn()
    await journeyLevelActions.validateJourneyDescription()
  })

  test('Verify language option from three dot options on top right in the selected journey page', async () => {
    const page = getSharedPage()

    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney()
    await journeyPage.createAndVerifyCustomJourney()
    await journeyLevelActions.selectExistingJourney()
    await journeyPage.clickThreeDotBtnOfCustomJourney()
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Edit Details'
    )
    await journeyLevelActions.enterLanguage('Adi')
    await journeyPage.clickSaveBtn()
    await journeyLevelActions.assertPersistedLanguageWhenReopeningEditDetails(
      journeyPage,
      'Adi'
    )
    await journeyPage.clickSaveBtn()
  })

  test('Verify copy link option from three dot options on top right in the selected journey page', async () => {
    const page = getSharedPage()
    const context = getSharedContext()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyLevelActions.setBrowserContext(context)
    await journeyPage.clickCreateCustomJourney()
    await journeyPage.createAndVerifyCustomJourney()
    const journeyName = await journeyPage.getJourneyName()
    await journeyLevelActions.selectCreatedJourney(journeyName)
    await journeyPage.clickThreeDotBtnOfCustomJourney()
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Copy Link'
    )
    await journeyLevelActions.verifySnackBarMsg('Link Copied')
  })

  test('Navigate to journey goal page', async () => {
    const page = getSharedPage()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney()
    await journeyPage.createAndVerifyCustomJourney()
    await journeyLevelActions.selectExistingJourney()
    await journeyLevelActions.clickNavigateToGoalBtn()
    await journeyLevelActions.verifyPageIsNavigatedToGoalPage()
  })

  test('Verify navigation side menu open and close via navigation list item toggle', async () => {
    const page = getSharedPage()
    const journeyLevelActions = new JourneyLevelActions(page)
    await journeyLevelActions.clickNavigationSideMenu()
    await journeyLevelActions.verifyNavigationSideMenuOpened()
    await journeyLevelActions.clickNavigationSideMenu()
    await journeyLevelActions.verifyNavigationSideMenuClosed()
  })

  test('Verify the user able to display the help window through help button', async () => {
    const page = getSharedPage()
    const journeyLevelActions = new JourneyLevelActions(page)
    await journeyLevelActions.clickHelpBtn()
    await journeyLevelActions.verifyHelpWindowOpened()
  })

  test('Verify manage access option from three dot options on top right in the selected journey page', async () => {
    const page = getSharedPage()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney()
    await journeyPage.createAndVerifyCustomJourney()
    const journeyName = await journeyPage.getJourneyName()
    await journeyLevelActions.selectCreatedJourney(journeyName)
    await journeyPage.clickThreeDotBtnOfCustomJourney()
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Manage Access'
    )
    await journeyLevelActions.enterTeamMember()
    await journeyLevelActions.clickPlusMemberInMemberPopup()
    await journeyLevelActions.verifyAccessAddedInManageEditors()
    await journeyLevelActions.clickDiaLogBoxCloseBtn()
  })

  test('verify copy to option for existing journey', async () => {
    const page = getSharedPage()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    const teamsPage = new TeamsPage(page)
    await teamsPage.createNewTeamAndVerifyCreatedTeam()
    await journeyPage.clickCreateCustomJourney()
    await journeyPage.createAndVerifyCustomJourney()
    const journeyName = await journeyPage.getJourneyName()
    await journeyLevelActions.clickThreeDotOfCreatedJourney(journeyName)
    await journeyLevelActions.clickThreeDotOptions('Copy to ...')
    await journeyLevelActions.clickSelectTeamDropDownIcon()
    await journeyLevelActions.selectTeamToCopyTheJourney()
    await journeyLevelActions.clickCopyButton()
    await journeyLevelActions.verifySnackBarMsg('Journey Copied')
    await journeyLevelActions.verifyCopiedTeamNameUpdatedInTeamSelectDropdown()
    await journeyLevelActions.verifyCopiedJournetInSelectedTeamList()
  })
})
