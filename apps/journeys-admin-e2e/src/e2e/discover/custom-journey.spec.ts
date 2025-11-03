/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'

import { CardLevelActionPage } from '../../pages/card-level-actions'
import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'
import { Register } from '../../pages/register-Page'

let userEmail = ''

test.describe('verify custom journey page', () => {
  test.beforeAll('Register new account', async ({ browser }) => {
    const page = await browser.newPage()
    const landingPage = new LandingPage(page)
    const register = new Register(page)
    await landingPage.goToAdminUrl()
    await register.registerNewAccount() // registering new user account
    userEmail = await register.getUserEmailId() // storing the registered user email id
    console.log(`userEamil : ${userEmail}`)
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.logInWithCreatedNewUser(userEmail) // login as registered user
  })

  // Verify the user able to create a journey with 'Create custom journey' button
  test('Create journey via Create custom journey button', async ({ page }) => {
    const journeyPage = new JourneyPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking the create custom journey button
    await journeyPage.createAndVerifyCustomJourney() // creating the custom journey and verifing the created journey is updated in the active tab list
  })

  // Verify the user able to delete the journey card in create custom journey page
  test('Detele journey card in custom journey page', async ({ page }) => {
    const journeyPage = new JourneyPage(page)
    const cardLevelActionPage = new CardLevelActionPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking the create custom journey button
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top of right corner of the custom journey page
    await journeyPage.clickEditDetailsInThreeDotOptions() // clicking on the title option of the thre dot options
    await journeyPage.enterTitle() // entering title on the title field in the 'edit title' popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'edit title' popup
    await cardLevelActionPage.hoverOnExistingCard() // hovering the mourse on the existing card in the card list from custom journey page
    await cardLevelActionPage.clicThreeDotOfCard() // clicking three dot at the top of the right corner in the selected card
    await cardLevelActionPage.clickDeleteCard() // clicking on the 'delete card' option of the the three dot options
    await journeyPage.clickDeleteBtn() //  clicking on delete button in the 'delete card' popup
    await cardLevelActionPage.verifyCardDeletedInCustomJournetPage() // verifying the card is deleted from the card list in the custom journey page
  })

  // Verify the user able to copy the existing journey card in create journey page
  test('Duplicate journey card in custom journey page', async ({ page }) => {
    const journeyPage = new JourneyPage(page)
    const cardLevelActionPage = new CardLevelActionPage(page)
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top of right corner of the custom journey page
    await journeyPage.clickEditDetailsInThreeDotOptions() // clicking on the title option of the thre dot options
    await journeyPage.enterTitle() // entering title on the title field in the 'edit title' popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'edit title' popup
    await cardLevelActionPage.getjourneyCardCount() // getting the card list count in the custom journey page
    await cardLevelActionPage.hoverOnExistingCard() // hovering the mourse on the existing card in the card list from custom journey page
    await cardLevelActionPage.clicThreeDotOfCard() // clicking three dot at the top of the right corner in the selected card
    await cardLevelActionPage.clickDuplicateCard() // clicking on the 'duplicate card' option of the the three dot options
    await cardLevelActionPage.verifyCardDuplicated() // verifying the card gets duplicated
  })

  // Verify the user able to preview the journey card in full screen mode in create custom journey page
  test('preview the journey from the custom journey page', async ({
    page,
    context
  }) => {
    const journeyPage = new JourneyPage(page)
    await journeyPage.setBrowserContext(context) // setting browser context
    await journeyPage.clickCreateCustomJourney() // clicking on the create custom journey button
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top of right corner of the custom journey page
    await journeyPage.clickEditDetailsInThreeDotOptions() // clicking on the title option of the thre dot options
    await journeyPage.enterTitle() // entering title on the title field in the 'edit title' popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'edit title' popup
    await journeyPage.enterJourneysTypography() // typing text on journeys typography field
    await journeyPage.clickDoneBtn() // clicking on done button below the card
    await journeyPage.verifyPreviewFromCustomJourneyPage() // clicking on the preview icon in the custom journey page and verifying the journey is loaded in the preview tab
  })
})
