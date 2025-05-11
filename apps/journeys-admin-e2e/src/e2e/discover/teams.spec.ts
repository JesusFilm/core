/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'

import { generateRandomString } from '../../framework/helpers'
import { JourneyLevelActions } from '../../pages/journey-level-actions-page'
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
    console.log(`userName : ${userEmail}`)
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
  test('Create a team and create a journey then rename the team', async ({
    page
  }) => {
    const teamsPage = new TeamsPage(page)
    const journeyName = new JourneyPage(page)
    // 1. Create a new team - Verify the user able to create the new team through New team option in menu icon in discover page
    await teamsPage.createNewTeamAndVerifyCreatedTeam()
    // 2. Create a journey (just one card) for newly created team - Newly created journeys for Newly created team are displayed
    await teamsPage.clickCreateJourneyBtn() // clicking create journey button in the center of the page for the new created team
    await journeyName.createAndVerifyCustomJourney()
    // 3. Rename the team (created team) - Verify the user able to rename the team through rename option in menu icon in discover page
    await teamsPage.verifyCreatedTeamRenamed()
  })

  // Discover page -> Three dot > Custom Domain
  test('Verify Custom Domain option from Three dot menu And validate journey link from the selected journey page', async ({
    page,
    context
  }) => {
    const domainName =
      'your.nextstep.' + (await generateRandomString(5)).toLowerCase()

    const journeyLevelActions = new JourneyLevelActions(page)
    const journeyPage = new JourneyPage(page)
    const teamPage = new TeamsPage(page)

    await journeyLevelActions.setBrowserContext(context) // setting the context
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
    const journeyName = await journeyPage.getJourneyName() // getting the journey name
    await teamPage.clickThreeDotOfTeams() //click three dot from the Discovery page teams section
    await teamPage.clickThreeDotOptions('Custom Domain') //select Custom Domain from the three dot menu
    await teamPage.enterCustomDomainName(domainName) //Entering custom domain
    await teamPage.clickConnectBtn() //clicking connect button to connect the custom domain
    await journeyLevelActions.verifySnackBarMsg('Custom domain updated') //verify toast message
    await teamPage.searchJourneyNameAndChooseFirstSuggestion(journeyName) //search and select the created journey's first match from the suggestion
    await journeyLevelActions.verifySnackBarMsg('Default journey set') //verify toast message
    const dnsContent = await teamPage.getDnsContentAndCopy() //click copy icon for DNS detail table and also get the text which is copied
    await journeyLevelActions.verifySnackBarMsg('Copied') //verify toast message
    await journeyPage.validateCopiedValues(dnsContent) //validate the copied DNS value with the value retrieved from the DNS table
    await teamPage.clickCustomDomainDialogCloseIcon() //close Domain Setting dialog popup
    await journeyLevelActions.selectCreatedJourney(journeyName) // clicking on the created journey in the journey list
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top right corner of the custom journey page
    await journeyLevelActions.clickThreeDotOptionsOfJourneyCreationPage(
      'Copy Link'
    ) // clicking on the Copy Link option of the three dot options
    await journeyLevelActions.verifySnackBarMsg('Link Copied') // verifying the toast message
    await journeyPage.validateCopiedValueContainsExpectedValue(domainName) //Validate that the copied link contains the custom domain
    await journeyPage.clickShareButtonInJourneyPage() // clicking on the Share button at top of the custom journey page
    await journeyPage.clickCopyIconInShareDialog() // clicking on the Copy icon of the Share option dialog popup
    await journeyLevelActions.verifySnackBarMsg('Link Copied') // verifying the toast message
    await journeyPage.validateUrlFieldInShareDialog(domainName) //Validate that the URL field from Share dialog contains the custom domain
  })

  // Discover page -> Three dot > Integrations
  test('Verify Integrations option from Three dot menu', async ({ page }) => {
    const teamPage = new TeamsPage(page)

    await teamPage.clickThreeDotOfTeams() //click three dot from the Discovery page teams section
    await teamPage.clickThreeDotOptions('Integrations') //select Integrations option from the three dot menu
    await teamPage.clickAddIntegrationButton() //Clicking Add integration '+' icon
    await teamPage.clickGrowthSpaceIntegration() //Clicking Growth Space integration
    await teamPage.enterAccessId('invalidAccessId') //enter invalid access id
    await teamPage.enterAccessSecret('invalidAccessSecret') //enter invalid access secret
    await teamPage.clickSaveBtnForintegration() //click save btn after entered the access id and secret
    await new JourneyLevelActions(page).verifySnackBarMsg(
      'invalid credentials for Growth Spaces integration'
    ) //verify toast message
  })
})
