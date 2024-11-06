/* eslint-disable playwright/no-skipped-test */
/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'

import { JourneyLevelActions } from '../../pages/journey-level-actions-page'
import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'
import { Register } from '../../pages/register-Page'
import { TeamsPage } from '../../pages/teams-page'

let userEmail = ''

test.describe('Journey level actions', () => {
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

  // Discover page -> Existing journey -> Edit
  test.skip('Edit existing journey', async ({ page }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    const journeyName = await journeyPage.getJourneyName()
    await journeyPage.clickCreateCustomJourney() // click the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyLevelActions.clickThreeDotOfCreatedJourney(journeyName) // clicking on the three dot of created journey in the journey list
    await journeyLevelActions.clickThreeDotOptions('Edit') // clicking on Edit option of the three dot options
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top right corner of the custom journey page
    await journeyPage.clickJourneyDetailsInThreeDotOptions() // clicking on the title option of the three dot options
    await journeyPage.enterTitle() // entering title on the title field in the 'journey details' popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'journey details' popup
    await journeyPage.backIcon() // clicking on the back icon in the custom jouney page
    await journeyLevelActions.verifyJourneyRenamedInActiveList() // verifying the journey is renamed and upadted in the journey list
  })

  // Discover page -> Existing journey -> Access
  test.fixme('Access for existing journey', async ({ page }) => {
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
  test('Preview existing journey', async ({ page, context }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    const journeyName = await journeyPage.getJourneyName() // getting journay name
    await journeyLevelActions.setBrowserContext(context) // setting context
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyLevelActions.clickThreeDotOfCreatedJourney(journeyName) // clicking on the three dot of created journey in the journey list
    await journeyLevelActions.verifyPreviewForExistingJourney() // clicking on the preview option in three dot options and verifying the journey is loaded on the preview tab
  })

  // Discover page -> Existing journey -> Duplicate
  test('Duplicate existing journey', async ({ page }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    const journeyName = await journeyPage.getJourneyName() // getting journay name
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyLevelActions.clickThreeDotOfCreatedJourney(journeyName) // clicking on the three dot of created journey in the journey list
    await journeyLevelActions.clickThreeDotOptions('Duplicate') // clicking on the duplicate option of the three dot options
    await journeyLevelActions.verifyExistingJourneyDuplicate() // verifying the journey gets duplicated and updated in the journey list
    await journeyLevelActions.verifySnackBarMsg('Journey Duplicated') // verifying the toast message
  })

  // Discover page -> Select an existing journey -> Three dots on top right -> Title
  test('Verify title option from three dot options on top right in the selected journey page', async ({
    page
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    const journeyName = await journeyPage.getJourneyName()
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await await journeyLevelActions.selectCreatedJourney(journeyName) // clicking on the created journey in the journey list
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top right corner of the custom journey page
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Edit Details'
    ) // clicking on the journey details option of the thre dot options
    await journeyLevelActions.enterTitle() // entering title on the title field in the 'journey details' popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'journey details' popup
    await journeyPage.backIcon() // clicking back icon at the top left corner in the custom journey page
    await journeyLevelActions.verifyJourneyRenamedInActiveList() // verifying journey is displaying in the journey list with the entered title
  })

  // Discover page -> Select an existing journey -> Three dots on top right -> Description
  test.skip('Verify description option from three dot options on top right in the selected journey page', async ({
    page
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    const journeyName = await journeyPage.getJourneyName() // getting journay name
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await await journeyLevelActions.selectCreatedJourney(journeyName) // clicking on the created journey in the journey list
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top right corner of the custom journey page
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Edit Details'
    ) // clicking on the description option of the three dot options
    await journeyLevelActions.enterDescription() // entering the description value on the description field in the 'journey details' popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'journey details' popup
    await journeyPage.backIcon() // clicking back icon at the top left corner in the custom journey page
    await journeyLevelActions.verifyDescriptionAddedForSelectedJourney() // verifying the journey is displaying in the journey list with added description below the journey title
  })

  // Discover page -> Select an existing journey -> Three dots on top right -> Language
  test('Verify language option from three dot options on top right in the selected journey page', async ({
    page
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyLevelActions.selectExistingJourney() // clicking on existing journey in the journey list
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top right corner of the custom journey page
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Edit Details'
    ) // clicking on the journey details option of the three dot options
    await journeyLevelActions.enterLanguage('A Che') // selecting language in the edit 'journey details popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'journey details' popup
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top right corner of the custom journey page
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Edit Details'
    ) // clicking on the language option of the three dot options
    await journeyLevelActions.verifySelectedLanguageInLanguagePopup() // verify selecetd language is updated in the 'journey details popup
    await journeyLevelActions.enterLanguage('A-Hmao') //  selecting language in the edit 'journey details popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'edit language' popup
  })

  // Discover page -> Select an existing journey -> Three dots on top right -> Copy Link
  test.fixme(
    'Verify copy link option from three dot options on top right in the selected journey page',
    async ({ page, context }) => {
      const journeyLevelActions = new JourneyLevelActions(page)
      const journeyPage = new JourneyPage(page)
      const journeyName = await journeyPage.getJourneyName() // getting the journey name
      await journeyLevelActions.setBrowserContext(context) // setting the context
      await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
      await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
      await journeyLevelActions.selectCreatedJourney(journeyName) // clicking on the created journey in the journey list
      await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top right corner of the custom journey page
      await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
        'Copy Link'
      ) // clicking on the Copy Link option of the three dot options
      await journeyLevelActions.verifySnackBarMsg('Link Copied') // verifying the toast message
      await journeyLevelActions.verifyLinkIsCopied() // verifying the copied link by opening a new tab and load the copied link
    }
  )

  // Verify the user able to navigate to journey goal page
  test('Navigate to journey goal page', async ({ page }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await await journeyLevelActions.selectExistingJourney() // clicking on existing journey in the journey list
    await journeyLevelActions.clickNavigateToGoalBtn() // clicking the strategy button
    await journeyLevelActions.verifyPageIsNavigatedToGoalPage() // verifying the page is navigated to goal page
  })

  // Verify the user able to hide and visible the side window through windows side button
  test('Verify navigation side menu open and close via navigation list item toggle', async ({
    page
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    await journeyLevelActions.clickNavigationSideMenu() // clicking on the navigation list Item arrow at top left corner
    await journeyLevelActions.verifyNavigationSideMenuOpened() // verify the navigation list drawer is expanded
    await journeyLevelActions.clickNavigationSideMenu() // clicking on the navigation list Item arrow at top left corner
    await journeyLevelActions.verifyNavigationSideMenuClosed() // verify the navigation list drawer is closed
  })

  // Verify the user able to display the help window through help button
  test('Verify the user able to display the help window through help button', async ({
    page
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    await journeyLevelActions.clickHelpBtn() // clicking on help button(question mark icon) at top right corner
    await journeyLevelActions.verifyHelpWindowOpened() // verifying the help window is showing in the Discover page
  })

  // Discover page -> Select an existing journey -> Three dots on top right -> Manage Access
  test('Verify manage access option from three dot options on top right in the selected journey page', async ({
    page
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    const journeyName = await journeyPage.getJourneyName() // getting journay name
    await journeyPage.clickCreateCustomJourney() // click the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await await journeyLevelActions.selectCreatedJourney(journeyName)
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top of right corner of the custom journey page
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Manage Access'
    ) // clicking on the manage access option of the thre dot options         await journeyLevelActions.enterTeamMember() // entering mail address of team member in the email field
    await journeyLevelActions.enterTeamMember() // enterning mail address of team member in the email field
    await journeyLevelActions.clickPlusMemberInMemberPopup() // clicking on plus icon in the manage editors popup
    await journeyLevelActions.verifyAccessAddedInManageEditors() // verifying entered member is displaying in the editors list
    await journeyLevelActions.clickDiaLogBoxCloseBtn() // clicking on x button at top right corner in the manage editors popup
  })

  // Discover page -> Existing journey -> Copy to
  test('verify copy to option for existing journey', async ({ page }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    const teamsPage = new TeamsPage(page)
    await teamsPage.createNewTeamAndVerifyCreatedTeam() // create new team and verify the created team
    const journeyName = await journeyPage.getJourneyName() // getting journay name
    await journeyPage.clickCreateCustomJourney() // click the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyLevelActions.clickThreeDotOfCreatedJourney(journeyName) // clicking on the three dot of created journey in the journey list        await journeyLevelActions.clickThreeDotOptions('Copy to ...') // clicking on the copy to ... option of the three dot options
    await journeyLevelActions.clickThreeDotOptions('Copy to ...') // clicking on the copy to ... option of the three dot options
    await journeyLevelActions.clickSelectTeamDropDownIcon() // cliking on the select team field in the 'copy to another team' popup
    await journeyLevelActions.selectTeamToCopyTheJourney() // selecting the team in the team list dropdown
    await journeyLevelActions.clickCopyButton() // clicking the copy button in the 'copy to another team' popup
    await journeyLevelActions.verifySnackBarMsg('Journey Copied') // verifying toast message
    await journeyLevelActions.verifyCopiedTeamNameUpdatedInTeamSelectDropdown() // verify the selected team is updated on the team select dropdownlist at top left corner
    await journeyLevelActions.verifyCopiedJournetInSelectedTeamList() // verifying the journey is copied to another team
  })
})
