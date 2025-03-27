/* eslint-disable playwright/no-skipped-test */
/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test'

import { CardLevelActionPage } from '../../pages/card-level-actions'
import { JourneyPage } from '../../pages/journey-page'
import { LandingPage } from '../../pages/landing-page'
import { LoginPage } from '../../pages/login-page'
import { Register } from '../../pages/register-Page'

let userEmail = ''

test.describe('verify card level actions', () => {
  test.beforeAll('Register new account', async ({ browser }) => {
    const page = await browser.newPage()
    const landingPage = new LandingPage(page)
    const register = new Register(page)
    await landingPage.goToAdminUrl()
    await register.registerNewAccount()
    userEmail = await register.getUserEmailId() // storing the registered user email id
    console.log(`userEamil : ${userEmail}`)
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    const landingPage = new LandingPage(page)
    const loginPage = new LoginPage(page)
    const cardLevelActionPage = new CardLevelActionPage(page)
    const journeyPage = new JourneyPage(page)
    await landingPage.goToAdminUrl()
    await loginPage.logInWithCreatedNewUser(userEmail) // login as registered user
    await journeyPage.clickCreateCustomJourney() //  clicking on the create custom journey button
    await cardLevelActionPage.waitUntilJourneyCardLoaded() // waiting for custom journey page loaded
    await cardLevelActionPage.clickOnJourneyCard() // clicking on the journey card
    await journeyPage.clickThreeDotBtnOfCustomJourney() // clicking on the three dot at top of right corner of the custom journey page
    await journeyPage.clickEditDetailsInThreeDotOptions() // clicking on the title option of the thre dot options
    await journeyPage.enterTitle() // entering title on the title field in the 'edit title' popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'edit title' popup
    await journeyPage.backIcon() // clicking back button at top of the left corner in the custom journey page
    await journeyPage.clickOnTheCreatedCustomJourney() // clicking on created journey in the journey list
    await cardLevelActionPage.clickOnJourneyCard() // clicking on the journey card
  })

  // Text - create, update & delete
  test('Text - create, update & delete', async ({ page }) => {
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickTextBtnInAddBlockDrawer() // clicking on text button in add block drawer
    await cardLevelActionPage.enterTextInJourneysTypographyField() // typing text on journeys typography field
    await cardLevelActionPage.clickAddBlockBtn() // clicking on done button
    await cardLevelActionPage.verifyTextAddedInJourneyCard() // verifying added journeys typography text in the journey card
    await cardLevelActionPage.clickOnCreatedOrRenamedTextInJourneyCard(
      'created'
    ) // clicking on created typography text in the journey card
    await cardLevelActionPage.editTextInJourneyCard() // editing the created typography text in the journey card
    await cardLevelActionPage.changeFontStyleInJourneyCardText('Header 1') // choosing the font size for edited typography text in the journey card
    await cardLevelActionPage.clickAddBlockBtn() // clicking on done button
    await cardLevelActionPage.verifyTextUpdatedInJourneyCard() // verifying the edited text is updated in the journey card
    await cardLevelActionPage.verifyTextStyleChangedInJourneyCard() // verifying the font size is changed to according to the choosen one.
    await cardLevelActionPage.clickOnCreatedOrRenamedTextInJourneyCard(
      'renamed'
    ) // clicking on edited typography text in the journey card
    await cardLevelActionPage.clickDeleteBtnInToolTipBar() // clicking delete button in the tooltip bar
    await cardLevelActionPage.verifyAddedTextDeletedFromJourneyCard() // verifying the added text is deleted from the card
  })

  // Image - create, update & delete
  test('Image - create, update & delete', async ({ page }) => {
    const cardLevelActionPage = new CardLevelActionPage(page)
    const journeyPage = new JourneyPage(page)
    await journeyPage.createCustomJourney()
    await cardLevelActionPage.clickAddBlockBtn()
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Image')
    await cardLevelActionPage.clickSelectImageBtn()
    await cardLevelActionPage.clickImageSelectionTab('Custom')
    await cardLevelActionPage.getImageSrc()
    await cardLevelActionPage.uploadImageInCustomTab()
    await cardLevelActionPage.verifyImageGotChanged()
    await cardLevelActionPage.clickDoneBtn()
    await cardLevelActionPage.clickDeleteBtnInToolTipBar()
    await cardLevelActionPage.verifyImageIsDeleted()
  })

  // Video - create, update & delete
  test('Video - create, update & delete', async ({ page }) => {
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.clickAddBlockBtn()
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Video')
    await cardLevelActionPage.clickSelectVideoBtn()
    await cardLevelActionPage.selectVideoTab('Upload')
    await cardLevelActionPage.uploadVideoInUploadTabOfVideoLibrary()
    await cardLevelActionPage.verifyUploadVideoInJourney('created')
    await cardLevelActionPage.clickDoneBtn()
    await cardLevelActionPage.clickDeleteBtnInToolTipBar()
  })

  // Poll - create, update & delete
  test('Poll - create, update & delete', async ({ page }) => {
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Poll') // clicking on poll button in add block drawer
    await cardLevelActionPage.verifyPollOptionAddedToCard() // verifying poll is added to the card
    await cardLevelActionPage.clickOnPollOptionInCard(1) // clicking on the first poll option (option 1)
    await cardLevelActionPage.clickOnPollProperties() // clicling on the poll actions in the poll option properties
    await cardLevelActionPage.clickUrlOrWebSiteOptionInPollOptionProperties() // selecting the URL/Website option in the 'navigate to' dropdown and entering the URL in the url field
    await cardLevelActionPage.renamedPollOptionInCard(1) // renaming the first poll option (option 1)
    await cardLevelActionPage.clickOnJourneyCard() // clickng on the journey card
    await cardLevelActionPage.verifyPollOptionGotRenamed() // verifying the option 1 is renamed
    await cardLevelActionPage.deleteAllThePollOptions() // deleting the poll option fron the card
    await cardLevelActionPage.verifyPollOptionsDeletedFromCard() // verifying the poll section is deleted from the card
  })

  // Text Input- create, update & delete
  test('Text Input - create, update & delete', async ({ page }) => {
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Text Input') // clicking on Feedback button in add block drawer
    await cardLevelActionPage.verifyFeedBackAddedToCard() // verifing the feedback is added to the card
    await cardLevelActionPage.clickFeedBackPropertiesDropDown('Text Input') // clicking the feedback property dropdown in the feedback properties drawer
    await cardLevelActionPage.enterLabelBelowFeedBcakProperty() // entering value in label field of feedback property dropdown
    await cardLevelActionPage.enterHintBelowFeedBcakProperty() // entering value in hint field of feedback property dropdown
    await cardLevelActionPage.clickOnJourneyCard() // clickng on the journey card
    await cardLevelActionPage.verifyLabelUpdatedIncard() // verifying the added label is updated in the card
    await cardLevelActionPage.verifyHintUpdatedInCard() // verifying the added hint is updated in the card
    await cardLevelActionPage.selectWholeFeedBackSection() // selecting the whole feedback section
    await cardLevelActionPage.updateMinimumRowsOptionFortextInput() // Changing minimum rows value and verifying the style property is getting changed for text input field
    await cardLevelActionPage.selectWholeFeedBackSection() // selecting the whole feedback section
    await cardLevelActionPage.clickDeleteBtnInToolTipBar() // clicking delete button in the tooltip bar
    await cardLevelActionPage.verifyFeedBackDeletedFromCard() // verifying the feedback section is deleted from the card
  })

  // Subscribe - create, update & delete
  test('Subscribe - create, update & delete', async ({ page }) => {
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Subscribe') // clicking on subscribe button in add block drawer
    await cardLevelActionPage.verifySubscribeAddedToCard() // verify subscribe section is added to the card
    await cardLevelActionPage.clickActionOfFeedBackProperties() // clicking the action property dropdown in the subscribe properties drawer
    await cardLevelActionPage.selectEmailOptionInPropertiesOptions() // selecting the 'Email' option in Subscribe action property and enter the email address
    await cardLevelActionPage.clickPropertiesDropDown('Button Icon') // clicking the 'button icon' property dropdown in the subscribe properties drawer
    await cardLevelActionPage.selectIconForProperties() // seleting an icon for the subscribe button section
    await cardLevelActionPage.verifySelecetdIconInCardBelowSubscribe() // veriying the Selected icon is updated in the subscribe section of the card
    await cardLevelActionPage.selectWholeSubscribeSectionInCard() // selecting the whole subscribe section
    await cardLevelActionPage.clickDeleteBtnInToolTipBar() // clicking delete button in the tooltip bar
    await cardLevelActionPage.verifyToastMessage() // verifying the toast message
    await cardLevelActionPage.verifySubscribeDeletedFromCard() //  verifying the subscribe section is deleted from the card
  })

  // Button - create, update & delete
  test('Button - create, update & delete', async ({ page }) => {
    const buttonName = 'Playwright'
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Button') // clicking on subscribe button in add block drawer
    await cardLevelActionPage.verifyButtonAddedToCard() // verify Button is added to the card
    await cardLevelActionPage.clickActionOfFeedBackProperties() // clicking the action property dropdown in the Button properties drawer
    await cardLevelActionPage.selectEmailOptionInPropertiesOptions() // selecting the 'Email' option in Button action property and enter the email address
    await cardLevelActionPage.clickButtonPropertyDropdown('Color') // clicking the 'Color' property dropdown in the Button properties drawer
    await cardLevelActionPage.chooseButtonColor('Primary') //Select Button Color as 'Primary Color'
    await cardLevelActionPage.clickButtonPropertyDropdown('Button Size') // clicking the 'Button Size' property dropdown in the Button properties drawer
    await cardLevelActionPage.chooseButtonSize('Small') // Select Button Size as 'Small'
    await cardLevelActionPage.clickButtonPropertyDropdown('Variant') // clicking the 'Variant' property dropdown in the Button properties drawer
    await cardLevelActionPage.chooseButtonVariant('Text') // select Button Vairant as 'Text'
    await cardLevelActionPage.clickButtonPropertyDropdown('Leading Icon') //Clicking the 'Variant' property dropdown in the Button properties drawer
    await cardLevelActionPage.clickIconDropdown() //Clicking Icon dropdown for 'Leading Icon' property
    await cardLevelActionPage.chooseIconFromList('Arrow Right') //Choose "Arrow Right" icon option from the list for Leading Icon property
    await cardLevelActionPage.chooseColorForIcon('Primary') //Leading Icon propety - Choose color for selected Icon as 'Primary'
    await cardLevelActionPage.clickButtonPropertyDropdown('Trailing Icon') //Clicking the 'Variant' property dropdown in the Button properties drawer
    await cardLevelActionPage.clickIconDropdown() //Clicking Icon dropdown for 'Leading Icon' property
    await cardLevelActionPage.chooseIconFromList('Chat Bubble') //Choose "Arrow Right" icon option from the list for Leading Icon property
    await cardLevelActionPage.chooseColorForIcon('Error') //Leading Icon propety - Choose color for selected Icon as 'Primary'
    await cardLevelActionPage.enterButtonNameInCard(buttonName) //Enter Button name in the card
    await cardLevelActionPage.verifyButtonPropertyUpdatedInCard(buttonName) //Button Name To validate in Card along with above selected properties
    await cardLevelActionPage.clickDeleteBtnInToolTipBar() //Clicking delete button in the tooltip bar to delete the Button from the card
    await cardLevelActionPage.verifyButtonRemovedFromCard() //Verifying the Button section is deleted from the card
  })

  // Spacer - create & delete
  test('Spacer - create & delete', async ({ page }) => {
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Spacer') // clicking on subscribe button in add block drawer
    await cardLevelActionPage.verifySpacerAddedToCard() // verify Spacer is added to the card
    const beforeChange =
      await cardLevelActionPage.getSpacerHeightPixelBeforeChange() //Get Spacer Height pixels before moving the slider
    await cardLevelActionPage.moveSpacerHeightTo() //Move Slider thumb to 50% of the Slider size
    await cardLevelActionPage.validateSpacerHeightPixelGotChange(beforeChange) // validate that space height pixels got increased
    await cardLevelActionPage.clickDeleteBtnInToolTipBar() //Clicking delete button in the tooltip bar to delete the Spacer from the card
    await cardLevelActionPage.verifySpacerRemovedFromCard() //Verifying the Spacer section is deleted from the card
  })
})
