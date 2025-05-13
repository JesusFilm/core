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
    console.log(`userName : ${userEmail}`)
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.logInWithCreatedNewUser(userEmail) // login as registered user
  })

  // Discover page -> Existing journey -> Edit Details
  test('Edit existing journey from journey card menu', async ({ page }) => {
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
  test('Edit existing journey from custom journey page', async ({ page }) => {
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
    await journeyPage.backIcon() // clicking on the back icon in the custom jouney page
    await journeyLevelActions.verifyJourneyRenamedInActiveList() // verifying the journey is renamed and updated in the journey list
  })

  // Discover page -> Existing journey -> Access
  test('Access for existing journey', async ({ page }) => {
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
    await journeyLevelActions.setBrowserContext(context) // setting context
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting journay name
    await journeyLevelActions.clickThreeDotOfCreatedJourney(journeyName) // clicking on the three dot of created journey in the journey list
    await journeyLevelActions.verifyPreviewForExistingJourney() // clicking on the preview option in three dot options and verifying the journey is loaded on the preview tab
  })

  // Discover page -> Existing journey -> Duplicate
  test('Duplicate existing journey', async ({ page }) => {
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

  // Discover page -> Select an existing journey -> Three dots on top right -> Title
  test('Verify title option from three dot options on top right in the selected journey page', async ({
    page
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName()
    await journeyLevelActions.selectCreatedJourney(journeyName) // clicking on the created journey in the journey list
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top right corner of the custom journey page
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Edit Details'
    ) // clicking on the Edit Details option of the thre dot options
    await journeyLevelActions.enterTitle() // entering title on the title field in the 'edit title' popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'edit title' popup
    await journeyPage.backIcon() // clicking back icon at the top left corner in the custom journey page
    await journeyLevelActions.verifyJourneyRenamedInActiveList() // verifying journey is displaying in the journey list with the entered title
  })

  // Discover page -> Select an existing journey -> Three dots on top right -> Description
  test('Verify description option from three dot options on top right in the selected journey page', async ({
    page
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting journay name
    await journeyLevelActions.selectCreatedJourney(journeyName) // clicking on the created journey in the journey list
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top right corner of the custom journey page
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Edit Details'
    ) // clicking on the description option of the three dot options
    await journeyLevelActions.enterDescription() // entering the description value on the description field in the 'edit description' popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'edit description' popup
    await journeyLevelActions.validateJourneyDescription() // verifying the description is updated in the journey details page
    //new UI descriptions details are not shown in the journey card list, so commenting the below line
    //await journeyPage.backIcon() // clicking back icon at the top left corner in the custom journey page
    //await journeyLevelActions.verifyDescriptionAddedForSelectedJourney() // verifying the journey is displaying in the journey list with added description below the journey title
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
    ) // clicking on the language option of the three dot options
    await journeyLevelActions.enterLanguage('Abau') // selecting language in the edit language popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'edit language' popup
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top right corner of the custom journey page
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Edit Details'
    ) // clicking on the language option of the three dot options
    await journeyLevelActions.verifySelectedLanguageInLanguagePopup() // verify selecetd language is updated in the edit language popup
    await journeyLevelActions.enterLanguage('English') //  clicking on save button in the 'edit language' popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'edit language' popup
  })

  // Discover page -> Select an existing journey -> Three dots on top right -> Copy Link
  test('Verify copy link option from three dot options on top right in the selected journey page', async ({
    page,
    context
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)

    await journeyLevelActions.setBrowserContext(context) // setting the context
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting the journey name
    await journeyLevelActions.selectCreatedJourney(journeyName) // clicking on the created journey in the journey list
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top right corner of the custom journey page
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Copy Link'
    ) // clicking on the Copy Link option of the three dot options
    await journeyLevelActions.verifySnackBarMsg('Link Copied') // verifying the toast message
    await journeyLevelActions.verifyLinkIsCopied() // verifying the copied link by opening a new tab and load the copied link
  })

  // Verify the user able to navigate to journey goal page
  test('Navigate to journey goal page', async ({ page }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    await journeyLevelActions.selectExistingJourney() // clicking on existing journey in the journey list
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
    await journeyPage.clickCreateCustomJourney() // click the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting journay name
    await journeyLevelActions.selectCreatedJourney(journeyName)
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

    await journeyPage.clickCreateCustomJourney() // click the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting journay name
    await journeyLevelActions.clickThreeDotOfCreatedJourney(journeyName) // clicking on the three dot of created journey in the journey list        await journeyLevelActions.clickThreeDotOptions('Copy to ...') // clicking on the copy to ... option of the three dot options
    await journeyLevelActions.clickThreeDotOptions('Copy to ...') // clicking on the copy to ... option of the three dot options
    await journeyLevelActions.clickSelectTeamDropDownIcon() // cliking on the select team field in the 'copy to another team' popup
    await journeyLevelActions.selectTeamToCopyTheJourney() // selecting the team in the team list dropdown
    await journeyLevelActions.clickCopyButton() // clicking the copy button in the 'copy to another team' popup
    await journeyLevelActions.verifySnackBarMsg('Journey Copied') // verifying toast message
    await journeyLevelActions.verifyCopiedTeamNameUpdatedInTeamSelectDropdown() // verify the selected team is updated on the team select dropdownlist at top left corner
    await journeyLevelActions.verifyCopiedJournetInSelectedTeamList() // verifying the journey is copied to another team
  })

  // Discover page -> Select an existing journey -> Share -> Copy icon
  test('Verify copy link icon from Share option dialog in the selected journey page', async ({
    page,
    context
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)

    await journeyLevelActions.setBrowserContext(context) // setting the context
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting the journey name
    await journeyLevelActions.selectCreatedJourney(journeyName) // clicking on the created journey in the journey list
    await journeyPage.clickShareButtonInJourneyPage() // clicking on the Share button at top of the custom journey page
    await journeyPage.clickCopyIconInShareDialog() // clicking on the Copy icon of the Share option dialog popup
    await journeyLevelActions.verifySnackBarMsg('Link Copied') // verifying the toast message
    await journeyLevelActions.verifyLinkIsCopied() // verifying the copied link by opening a new tab and load the copied link
  })

  // Discover page -> Select an existing journey -> Share -> Edit Url
  test('Verify Edit Url option from Share option dialog in the selected journey page', async ({
    page,
    context
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)

    await journeyLevelActions.setBrowserContext(context) // setting the context
    await journeyPage.setBrowserContext(context) // setting the context
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting the journey name
    await journeyLevelActions.selectCreatedJourney(journeyName) // clicking on the created journey in the journey list
    await journeyPage.clickShareButtonInJourneyPage() // clicking on the Share button at top of the custom journey page
    const urlSlug = await journeyPage.editUrlAndSave() // clicking on the Edit Url button, update URL Slug and save in the Share option dialog popup
    await journeyPage.clickCopyIconInShareDialog() // clicking on the Copy icon of the Share option dialog popup
    await journeyLevelActions.verifySnackBarMsg('Link copied') // verifying the toast message
    //await journeyLevelActions.verifyLinkIsCopied() // verifying the copied link by opening a new tab and load the copied link
    await journeyPage.verifyUpdatedUrlSlugIsLoaded(urlSlug) // verifyinh that the updated url is loaded
  })

  // Discover page -> Select an existing journey -> Share -> Embed Journey
  test('Verify Embed Journey option from Share option dialog in the selected journey page', async ({
    page,
    context
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)

    await journeyLevelActions.setBrowserContext(context) // setting the context
    await journeyPage.setBrowserContext(context) // setting the context
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting the journey name
    await journeyLevelActions.selectCreatedJourney(journeyName) // clicking on the created journey in the journey list
    await journeyPage.clickShareButtonInJourneyPage() // clicking on the Share button at top of the custom journey page
    await journeyPage.clickButtonInShareDialog('Embed Journey') // CLick Embed Journey button in the Share option dialog
    const embedCode =
      await journeyPage.validateUrlInEmbedCodeFieldAndReturnEmbedCode() //Validate Embed iframe with the url before copying the code
    await journeyPage.clickDialogActionBtnsInShareDialog('Copy Code') //CLicking Copy Code button to copy the embedded iframe code
    await journeyLevelActions.verifySnackBarMsg('Code Copied') // verifying the toast message
    await journeyPage.validateCopiedValues(embedCode) // verifying the copied code and embed in textarea is same
    await journeyPage.clickDialogActionBtnsInShareDialog('Cancel') //CLicking Cancel button to return to url slug page
  })

  // Discover page -> Select an existing journey -> Share -> QR Code (download png & Copy Short Link)
  test('Verify QR Code option from Share option dialog in the selected journey page', async ({
    page,
    context
  }) => {
    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)

    await journeyLevelActions.setBrowserContext(context) // setting the context
    await journeyPage.setBrowserContext(context) // setting the context
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting the journey name
    await journeyLevelActions.selectCreatedJourney(journeyName) // clicking on the created journey in the journey list
    await journeyPage.clickShareButtonInJourneyPage() // clicking on the Share button at top of the custom journey page
    await journeyPage.clickButtonInShareDialog('QR Code') // CLick QR Code button in the Share option dialog
    await journeyPage.clickButtonInShareDialog('Generate Code') //Click Generate Code button to generate qr code
    await journeyPage.downloadQRCodeAsPng() // download QR code as png file in the project folder
    await journeyPage.validateDownloadedQrPngFile() //validate that the png is downloaded in the expected project folder with file extension as .png
    await journeyPage.clickDownloadDropDownAndSelectCopyShortLink() //Clicking downlaod dropdown and click copy short link option to copy the url
    await journeyLevelActions.verifySnackBarMsg('Link copied') // verifying the toast message
    await journeyPage.clickCloseIconForQrCodeDialog() //Click close icon to close the QR code dialog popup
    await journeyLevelActions.verifyLinkIsCopied() // verifying the copied link by opening a new tab and load the copied link
  })
})
