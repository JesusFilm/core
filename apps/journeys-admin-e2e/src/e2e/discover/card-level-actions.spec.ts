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
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Image') // clicking on image button in add block drawer
    await cardLevelActionPage.clickSelectImageBtn() // clicking on select image buttom in image properties drawer
    await cardLevelActionPage.clickImageSelectionTab('Custom') // clicking on custom tab in image drawer tab list
    await cardLevelActionPage.getImageSrc() // getting current image source
    await cardLevelActionPage.uploadImageInCustomTab() // uploading image in the custom tab
    //  await cardLevelActionPage.verifyImgUploadedSuccessMsg() // verifying the 'Upload successful' message
    await cardLevelActionPage.verifyImageGotChanged() // verifying the image is updated in the custom tab
    await cardLevelActionPage.clickImageSelectionTab('Gallery') // clicking on Gallery tab in image drawer tab list
    await cardLevelActionPage.getImageSrc() // getting current image source
    await cardLevelActionPage.clickImgFromFeatureOfGalleryTab() // selecting an image of Gallery tab in the image drawer
    await cardLevelActionPage.verifyImageGotChanged() // verifying the seleted image is updated in the image drawer
    await cardLevelActionPage.clickImgDeleteBtn() // deleting the selected image
    await cardLevelActionPage.verifyImageIsDeleted() // verifying the image is deleted from the image drawer
  })

  // Video - create, update & delete
  test.skip('Video - create, update & delete', async ({ page }) => {
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.deleteAllAddedCardProperties() // deleting all the added properties in the card
    await cardLevelActionPage.clickOnVideoJourneyCard() // clicking on the journey card
    await cardLevelActionPage.clickCardPropertiesDropDown('Background') // clicking on the Background dropdown in Card Properties slide
    await cardLevelActionPage.clickSelectedImageBtn() // click Selected Image to navigate to edit image slide
    await cardLevelActionPage.clickImgDeleteBtn() // deleting the selected image
    await cardLevelActionPage.verifyImageIsDeleted() // verifying the image is deleted from the image drawer
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Video') // clicking on video button in add block drawer
    await cardLevelActionPage.clickSelectVideoBtn() // clicking on select video  buttom in video properties drawer
    await cardLevelActionPage.selectVideoTab('Upload') // clicking on upload tab in video Libarary tab list
    await cardLevelActionPage.uploadVideoInUploadTabOfVideoLibrary() // upload video in upload tab
    await cardLevelActionPage.verifyUploadVideoInJourney('created') // below the video source property, verifying video is uploaded
    await cardLevelActionPage.clickVideoEditPenIcon() // clicking on pen icon for update the video
    await cardLevelActionPage.clickChangeVideoOption() // clicking the Change Video option in the video details page
    await cardLevelActionPage.selectVideoTab('Library') // clicking on the Library tab in video Libarary tab list
    await cardLevelActionPage.getVideoNameVideoFromLibraryTabOfVideoLibraryPage() // getting a video file name of video Library Page video
    await cardLevelActionPage.selectVideoFromLibraryTabOfVideoLibararyPage() // selecting a video from the Library tab's videos
    await cardLevelActionPage.clickSelectBtnAfterSelectingVideo() // clicking the select button after selecting the video from Library tab
    await cardLevelActionPage.verifyUploadVideoInJourney('updated') // below the video source property, verify selected video is updated
    await cardLevelActionPage.clickVideoEditPenIcon() // clicking on pen icon for delete the video
    await cardLevelActionPage.clickVideoDeleteIconInDrawer() // clicking the delete icon beside the change video button in the video details page
    await cardLevelActionPage.verifyVideoDeletedFromDrawer() // verifying video deleted from the video source property
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

  // Response Field- create, update & delete
  test('Response Field - create, update & delete', async ({ page }) => {
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Response Field') // clicking on Response Field button in add block drawer
    await cardLevelActionPage.verifyFeedBackAddedToCard() // verifing the Response Field is added to the card
    await cardLevelActionPage.clickFeedBackPropertiesDropDown('Response Field') // clicking the Response Field property dropdown in the Response Field properties drawer
    await cardLevelActionPage.enterLabelBelowFeedBcakProperty() // entering value in label field of Response Field property dropdown
    await cardLevelActionPage.enterHintBelowFeedBcakProperty() // entering value in hint field of Response Field property dropdown
    await cardLevelActionPage.clickOnJourneyCard() // clickng on the journey card
    await cardLevelActionPage.verifyLabelUpdatedIncard() // verifying the added label is updated in the card
    await cardLevelActionPage.verifyHintUpdatedInCard() // verifying the added hint is updated in the card
    await cardLevelActionPage.selectWholeFeedBackSection() // selecting the whole Response Field section
    await cardLevelActionPage.updateMinimumRowsOptionFortextInput() // Changing minimum rows value and verifying the style property is getting changed for text input field
    await cardLevelActionPage.selectWholeFeedBackSection() // selecting the whole Response Field section
    await cardLevelActionPage.clickDeleteBtnInToolTipBar() // clicking delete button in the tooltip bar
    await cardLevelActionPage.verifyFeedBackDeletedFromCard() // verifying the Response Field section is deleted from the card
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
    await cardLevelActionPage.verifySpacerRemovedFromCard() //validate spacer got removed from the card after delete
  })

  // Footer properties (Journey) - Reactions, Display Title, Hosted By & Chat Widget
  test('Footer properties (Journey) - create, update & delete', async ({
    page
  }) => {
    const footerTitle = 'Footer Playwright'
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.selectWholeFooterSectionInCard() // selecting the whole Footer section
    await cardLevelActionPage.expandJourneyAppearance('Reactions') // clicking on the 'Reactions' tab from the tab list of footer properties drawer
    await cardLevelActionPage.selectAllTheReactionOptions() // Select all the reaction checkboxes 'Share', 'Like', 'DisLike'
    await cardLevelActionPage.expandJourneyAppearance('Display Title') // clicking on the 'Display Title' tab from the tab list of footer properties drawer
    await cardLevelActionPage.enterDisplayTitleForFooter(footerTitle) // Enter Display title for the Footer Section
    await cardLevelActionPage.expandJourneyAppearance('Hosted By') // clicking on the 'Hosted By' tab from the tab list of footer properties drawer
    await cardLevelActionPage.clicSelectHostBtn() // clicking the 'select a host' button below the 'Hosted by' tab in the footer properties drawer
    await cardLevelActionPage.clickCreateNewBtn() // clicking the 'create new' button below the 'Hosted by' tab in the footer properties drawer
    await cardLevelActionPage.enterHostName() // entering host name in the host field in the footer properties drawer
    await cardLevelActionPage.enterLocation() // entering location in the location field in the footer properties drawer
    await cardLevelActionPage.clickOnJourneyCard() // clickng on the journey card
    await cardLevelActionPage.verifyHostNameAddedInCard() // verifying the added host name and location are updated in the footer section at bottom of the card
    await cardLevelActionPage.selectWholeFooterSectionInCard() // selecting the whole Footer section
    await cardLevelActionPage.expandJourneyAppearance('Chat Widget') // clicking on the 'Chat Widget' tab from the tab list of footer properties drawer
    await cardLevelActionPage.clickMessangerDropDown('WhatsApp') // clicking the whatsapp dropdown check box
    await cardLevelActionPage.enterWhatsAppLink() // entering link value on the URL field
    await cardLevelActionPage.verifyChatWidgetAddedToCard() // verifying the selected messager icon is updated in the footer section at bottom of the card
    await cardLevelActionPage.validateFooterTitleAndReactionButtonsInCard(
      footerTitle
    ) //Verifying the Footer Title and Reactions in the card
  })

  // Footer properties (WebSite) - Logo, Display Title, Menu & Chat Widget
  test('Footer properties (WebSite) - create, update & delete', async ({
    page
  }) => {
    const footerTitle = 'Footer Playwright'
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.selectWholeFooterSectionInCard() // selecting the whole Footer section
    await cardLevelActionPage.clickJourneyOrWebSiteOptionForFooter('Website') //Select WebSite option in the top of the footer property
    await cardLevelActionPage.expandJourneyAppearance('Logo') // clicking on the 'Logo' tab from the tab list of footer properties drawer
    await cardLevelActionPage.clickSelectImageBtn() // Select Plus icon to add the Image
    await cardLevelActionPage.selectFirstImageFromGalleryForFooter() //Select first image from the gallery for the Footer section
    await cardLevelActionPage.valdiateSelectedImageWithDeleteIcon() //Verifying the Selected Image with Delete icon is display
    await cardLevelActionPage.closeToolDrawerForFooterImage() // Close the tool drawer after selected the Image
    await cardLevelActionPage.validateSelectedImageWithEditIcon() //Verifying the Selected image is showing under Logo section with edit button
    await cardLevelActionPage.expandJourneyAppearance('Display Title') // clicking on the 'Display Title' tab from the tab list of footer properties drawer
    await cardLevelActionPage.enterDisplayTitleForFooter(footerTitle) // Enter Display title for the Footer Section
    await cardLevelActionPage.expandJourneyAppearance('Menu') // clicking on the 'Menu' tab from the tab list of footer properties drawer
    await cardLevelActionPage.clickSelectIconDropdownForFooterMenu() //Click Select icon dropdown for Menu
    await cardLevelActionPage.selectChevronDownIconForFooter() // Select ChevronDownIcon for Menu icon
    await cardLevelActionPage.selectWholeFooterSectionInCard() // selecting the whole Fotter section
    await cardLevelActionPage.expandJourneyAppearance('Chat Widget') // clicking on the 'Chat Widget' tab from the tab list of footer properties drawer
    await cardLevelActionPage.clickMessangerDropDown('WhatsApp') // clicking the whatsapp dropdown check box
    await cardLevelActionPage.enterWhatsAppLink() // entering link value on the URL field
    await cardLevelActionPage.verifyChatWidgetAddedToCard() // verifying the selected messager icon is updated in the footer section at bottom of the card
    await cardLevelActionPage.validateWebsiteFooterSectionInCard(footerTitle) //Verifying the Selected Image, Display Title and menu icon are showing at the top of the card
    await cardLevelActionPage.expandJourneyAppearance('Menu') // clicking on the 'Menu' tab from the tab list of footer properties drawer
    await cardLevelActionPage.clickCreateMenuCardButtonInMenuFooter() //Click create menu card button to create menu card
    await cardLevelActionPage.clickleftSideArrowIcon() //Click Left Chevron button to navigate to react flow panel
    await cardLevelActionPage.validateMenuCardInReactFlow() //Verifying the Menu card in react flow panel
  })
})
