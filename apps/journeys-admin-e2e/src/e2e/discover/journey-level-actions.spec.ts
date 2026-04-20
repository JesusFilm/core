/* eslint-disable playwright/expect-expect */
import type { BrowserContext, Page } from 'playwright-core'

import {
  newContextWithWorkerStorageState,
  test
} from '../../fixtures/workerAuth'
import { JourneyLevelActions } from '../../pages/journey-level-actions-page'
import { JourneyPage } from '../../pages/journey-page'

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

test.describe('Journey level actions', () => {
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

  // Discover page -> Existing journey -> Edit Details
  test('Edit existing journey from journey card menu', async () => {
    const page = getSharedPage()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)

    await journeyPage.clickCreateCustomJourney() // click the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting the journey name
    await journeyLevelActions.clickThreeDotOfCreatedJourney(journeyName) // clicking on the three dot of created journey in the journey list
    await journeyLevelActions.clickThreeDotOptions('Edit Details') // clicking on Edit Details option of the three dot button
    await journeyLevelActions.enterTitle() // renaming the title on the title field in the 'edit title' popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'edit title' popup
    await journeyLevelActions.verifyJourneyRenamedInActiveList() // verifying the journey is renamed and updated in the journey list
  })

  // Discover page -> Existing journey -> Custom Journey -> Edit details
  test('Edit existing journey from custom journey page', async () => {
    const page = getSharedPage()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)

    await journeyPage.clickCreateCustomJourney() // click the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting the journey name
    await journeyLevelActions.selectCreatedJourney(journeyName) // clicking on the created journey in the journey list
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top right corner of the custom journey page
    await journeyPage.clickEditDetailsInThreeDotOptions() // clicking on the title option of the three dot options
    await journeyLevelActions.enterTitle() // renaming the title on the title field in the 'edit title' popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'edit title' popup
    await journeyPage.backToHome() // clicking on the NextSteps logo icon in the custom jouney page
    await journeyLevelActions.verifyJourneyRenamedInActiveList() // verifying the journey is renamed and updated in the journey list
  })

  // Discover page -> Existing journey -> Access
  test('Access for existing journey', async () => {
    const page = getSharedPage()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney() // click the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyLevelActions.clickThreeDotOfExistingJourney() // clicking three dot of existing journey in the journey list
    await journeyLevelActions.clickThreeDotOptions('Access') // clicking on the access option of the three dot options and it will open manage editors popup
    await journeyLevelActions.enterTeamMember() // manage editors popup, entering mail address of team member in the email field
    await journeyLevelActions.clickPlusMemberInMemberPopup() // clicking on plus icon in the manage editors popup
    await journeyLevelActions.verifyAccessAddedInManageEditors() // verifying entered member is displaying in the editors list
    await journeyLevelActions.clickDiaLogBoxCloseBtn() // clicking on x button at top right corner in the manage editors popup to close
  })

  // Discover page -> Existing journey -> Preview
  test('Preview existing journey', async () => {
    const page = getSharedPage()
    const context = getSharedContext()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyLevelActions.setBrowserContext(context) // setting context
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting journay name
    await journeyLevelActions.clickThreeDotOfCreatedJourney(journeyName) // clicking on the three dot of created journey in the journey list
    await journeyLevelActions.verifyPreviewForExistingJourney() // clicking on the preview option in three dot options and verifying the journey is loaded on the preview tab
  })

  // Discover page -> Existing journey -> Duplicate
  test('Duplicate existing journey', async () => {
    const page = getSharedPage()
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting journay name
    await journeyLevelActions.clickThreeDotOfCreatedJourney(journeyName) // clicking on the three dot of created journey in the journey list
    await journeyLevelActions.clickThreeDotOptions('Duplicate') // clicking on the duplicate option of the three dot options
    await journeyLevelActions.verifyExistingJourneyDuplicate() // verifying the journey gets duplicated and updated in the journey list
    await journeyLevelActions.verifySnackBarMsg('Journey Duplicated') // verifying the toast message
  })
})
