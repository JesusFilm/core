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
    console.log('userEamil : ' + userEmail)
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
    await journeyPage.clickTitleInThreeDotOptions() // clicking on the title option of the thre dot options
    await journeyPage.enterTitle() // entering title on the title field in the 'edit title' popup
    await journeyPage.clickSaveBtn() // clicking on save button in the 'edit title' popup
    await journeyPage.backIcon() // clicking back button at top of the left corner in the custom journey page
    await journeyPage.clickOnTheCreatedCustomJourney() // clicking on created journey in the journey list
    await cardLevelActionPage.clickOnJourneyCard() // clicking on the journey card
  })

  // Text - create, update & delete
  test.fixme('Text - create, update & delete', async ({ page }) => {
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Text') // clicking on text button in add block drawer
    await cardLevelActionPage.enterTextInJourneysTypographyField() // typing text on journeys typography field
    await cardLevelActionPage.clickDoneBtn() // clicking on done button
    await cardLevelActionPage.verifyTextAddedInJourneyCard() // verifying added journeys typography text in the journey card
    await cardLevelActionPage.clickOnCreatedOrRenamedTextInJourneyCard(
      'created'
    ) // clicking on created typography text in the journey card
    await cardLevelActionPage.editTextInJourneyCard() // editing the created typography text in the journey card
    await cardLevelActionPage.changeFontStyleInJourneyCardText('Header 1') // choosing the font size for edited typography text in the journey card
    await cardLevelActionPage.clickDoneBtn() // clicking on done button
    await cardLevelActionPage.verifyTextUpdatedInJourneyCard() // verifying the edited text is updated in the journey card
    await cardLevelActionPage.verifyTextStyleChangedInJourneyCard() // verifying the font size is changed to according to the choosen one.
    await cardLevelActionPage.clickOnCreatedOrRenamedTextInJourneyCard(
      'renamed'
    ) // clicking on edited typography text in the journey card
    await cardLevelActionPage.clickDeleteBtnInToolTipBar() // clicking delete button in the tooltip bar
    await cardLevelActionPage.verifyAddedTextDeletedFromJourneyCard() // verifying the added text is deleted from the card
  })

  // Image - create, update & delete
  test.fixme('Image - create, update & delete', async ({ page }) => {
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
  // Issue 3 : In video properties drawer after uploaded a video in upload tab, unable to update that video
  // Issue 4 : the 'video details' page shows again and again.
  test.fixme('Video - create, update & delete', async ({ page }) => {
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.deleteAllAddedCardProperties() // deleting all the added properties in the card
    await cardLevelActionPage.clickOnVideoJourneyCard() // clicking on the journey card
    await cardLevelActionPage.clickOnVideoJourneyCard() // clicking on the journey card
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Video') // clicking on video button in add block drawer
    await cardLevelActionPage.clickSelectVideoBtn() // clicking on select video  buttom in video properties drawer
    await cardLevelActionPage.selectVideoTab('Upload') // clicking on upload tab in video Libarary tab list
    await cardLevelActionPage.uploadVideoInUploadTabOfVideoLibrary() // upload video in upload tab
    await cardLevelActionPage.verifyUploadVideoInJourney('created') // below the video source property, verifying video is uploaded
    await cardLevelActionPage.clickVideoEditPenIcon() // clicking on pen icon for update the video
    await cardLevelActionPage.closeIconOfVideoDetails() // clicking the x icon in video details page at top of the right corner
    await cardLevelActionPage.selectVideoTab('Library') // clicking on the Library tab in video Libarary tab list
    await cardLevelActionPage.getVideoNameVideoFromLibraryTabOfVideoLibraryPage() // getting a video file name of video Library Page video
    await cardLevelActionPage.selectVideoFromLibraryTabOfVideoLibararyPage() // selecting a video from the Library tab's videos
    await cardLevelActionPage.clickSelectBtnAfrerSelectingVideo() // clicking the select button after selecting the video from Library tab
    await cardLevelActionPage.verifyUploadVideoInJourney('updated') // below the video source property, verify selected video is updated
    await cardLevelActionPage.clickVideoEditPenIcon() // clicking on pen icon for delete the video
    await cardLevelActionPage.clickVideoDeleteIconInDrawer() // clicking the delete icon beside the change video button in the video details page
    await cardLevelActionPage.verifyVideoDeletedFromDrawer() // verifying video deleted from the video source property
  })

  // Poll - create, update & delete
  test.fixme('Poll - create, update & delete', async ({ page }) => {
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

  // Feedback- create, update & delete
  test.fixme('Feedback - create, update & delete', async ({ page }) => {
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Feedback') // clicking on Feedback button in add block drawer
    await cardLevelActionPage.verifyFeedBackAddedToCard() // verifing the feedback is added to the card
    await cardLevelActionPage.clickFeedBackPropertiesDropDown('Feedback') // clicking the feedback property dropdown in the feedback properties drawer
    await cardLevelActionPage.enterLabelBelowFeedBcakProperty() // entering value in label field of feedback property dropdown
    await cardLevelActionPage.enterHintBelowFeedBcakProperty() // entering value in hint field of feedback property dropdown
    await cardLevelActionPage.clickOnJourneyCard() // clickng on the journey card
    await cardLevelActionPage.verifyLabelUpdatedIncard() // verifying the added label is updated in the card
    await cardLevelActionPage.verifyHintUpdatedInCard() // verifying the added hint is updated in the card
    await cardLevelActionPage.selectWholeFeedBackSection() // selecting the whole feedback section
    await cardLevelActionPage.clickFeedBackPropertiesDropDown('Action') // clicking the action property dropdown in the feedback properties drawer
    await cardLevelActionPage.clickActionOfFeedBackProperties() // selecting the email option in the 'navigate to' dropdown
    await cardLevelActionPage.selectEmailOptionInPrepertiesOptions() // below the action property, entering email address in the email field
    await cardLevelActionPage.clickFeedBackPropertiesDropDown('Button Icon') // /clicking the 'button icon' property dropdown in the feedback properties drawer
    await cardLevelActionPage.selectIconForProperties() // seleting an icon for the feedback button section
    await cardLevelActionPage.verifySelectedIconInCardBelowFeedBack() // veriying the Selected icon is updated in the feed back section of the card
    await cardLevelActionPage.selectWholeFeedBackSection() // selecting the whole feedback section
    await cardLevelActionPage.clickDeleteBtnInToolTipBar() // clicking delete button in the tooltip bar
    await cardLevelActionPage.verifyFeedBackDeletedFromCard() // verifying the feedback section is deleted from the card
  })

  // Subscribe - create, update & delete
  test.fixme('Subscribe - create, update & delete', async ({ page }) => {
    const cardLevelActionPage = new CardLevelActionPage(page)
    await cardLevelActionPage.clickAddBlockBtn() // clicking on add block button
    await cardLevelActionPage.clickBtnInAddBlockDrawer('Subscribe') // clicking on subscribe button in add block drawer
    await cardLevelActionPage.verifySubscribeAddedToCard() // verify subscribe section is added to the card
    await cardLevelActionPage.clickActionOfFeedBackProperties() // clicking the action property dropdown in the subscribe properties drawer
    await cardLevelActionPage.selectEmailOptionInPrepertiesOptions() // selecting the 'Selected card' option in 'navigate to' options and below the selecting the card for navigation
    await cardLevelActionPage.clickSubscribePropertiesDropDown('Button Icon') // clicking the 'button icon' property dropdown in the subscribe properties drawer
    await cardLevelActionPage.selectIconForProperties() // seleting an icon for the subscribe button section
    await cardLevelActionPage.verifySelecetdIconInCardBelowSubscribe() // veriying the Selected icon is updated in the subscribe section of the card
    await cardLevelActionPage.selectWholeSubscribeSectionInCard() // selecting the whole subscribe section
    await cardLevelActionPage.clickDeleteBtnInToolTipBar() // clicking delete button in the tooltip bar
    await cardLevelActionPage.verifySubscribeDeletedFromCard() //  verifying the subscribe section is deleted from the card
  })

  // Footer properties - Hosted By & Chat Widget
  // eslint-disable-next-line playwright/no-skipped-test
  test.fixme(
    'Footer properties - create, update & delete',
    async ({ page }) => {
      const cardLevelActionPage = new CardLevelActionPage(page)
      await cardLevelActionPage.selectWholeFooterSectionInCard() // selecting the whole Fotter section
      await cardLevelActionPage.clicSelectHostBtn() // clicking the 'select a host' button below the 'Hosted by' tab in the footer properties drawer
      await cardLevelActionPage.clickCreateNewBtn() // clicking the 'create new' button below the 'Hosted by' tab in the footer properties drawer
      await cardLevelActionPage.enterHostName() // entering host name in the host field in the footer properties drawer
      await cardLevelActionPage.enterLocation() // entering location in the location field in the footer properties drawer
      await cardLevelActionPage.clickOnJourneyCard() // clickng on the journey card
      await cardLevelActionPage.verifyHostNameAddedInCard() // verifying the added host name and location are updated in the footer section at bottom of the card
      await cardLevelActionPage.selectWholeFooterSectionInCard() // selecting the whole Fotter section
      await cardLevelActionPage.clickTabInFooterProperties('Chat Widget') // clicking on the 'Chat Widget' tab from the tab list of footer properties drawer
      await cardLevelActionPage.clickMessangerDropDown('WhatsApp') // clicking the whatsapp dropdown check box
      await cardLevelActionPage.enterWhatsAppLink() // entering link value on the URL field
      await cardLevelActionPage.verifyChatWidgetAddedToCard() // verifying the selected messager icon is updated in the footer section at bottom of the card
    }
  )
})
