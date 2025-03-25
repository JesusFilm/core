/* eslint-disable playwright/no-force-option */
/* eslint-disable playwright/no-conditional-expect */
/* eslint-disable playwright/no-wait-for-timeout */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import dayjs from 'dayjs'
import type { Page } from 'playwright-core'

import testData from '../utils/testData.json'

const sixtySecondsTimeout = 60000
export class CardLevelActionPage {
  readonly page: Page
  randomNumber: string
  journeyName: string
  renameJourmeyName: string
  journeyCardFrame =
    'div[data-testid="EditorCanvas"] div[data-testid="CanvasContainer"] iframe'
  uploadedImgSrc
  seletedVideo
  pollRename: string
  journeyCardSize: number
  constructor(page: Page) {
    this.page = page
    this.randomNumber =
      dayjs().format('DDMMYY-hhmmss') +
      Math.floor(Math.random() * (100 - 999 + 1) + 999)
    this.journeyName = testData.journey.firstJourneyName + this.randomNumber
  }

  async clickOnJourneyCard() {
    await this.page
      .frameLocator(this.journeyCardFrame)
      .first()
      .locator('div[data-testid="CardOverlayImageContainer"]')
      .first()
      .click({ delay: 1000 })
  }

  async clickOnVideoJourneyCard() {
    await this.page
      .frameLocator(this.journeyCardFrame)
      .first()
      .locator(
        'div[data-testid="CardOverlayImageContainer"] img[data-testid="background-image"]'
      )
      .first()
      .click({ timeout: sixtySecondsTimeout, force: true })
  }

  async clickAddBlockBtn() {
    await expect(
      this.page.locator('button[data-testid="Fab"]', { hasText: 'Add Block' })
    ).toHaveCount(1, { timeout: sixtySecondsTimeout })
    await this.page
      .locator('button[data-testid="Fab"]', { hasText: 'Add Block' })
      .click({ timeout: sixtySecondsTimeout })
  }

  async clickBtnInAddBlockDrawer(buttonName: string) {
    await this.page
      .locator('div[data-testid="SettingsDrawer"] button', {
        hasText: buttonName
      })
      .click()
  }

  async clickTextBtnInAddBlockDrawer() {
    await this.page
      .locator(
        'div[data-testid="JourneysAdminButtonNewTypographyButton"] button'
      )
      .click()
  }

  async enterTextInJourneysTypographyField() {
    await this.page
      .frameLocator(this.journeyCardFrame)
      .first()
      .locator(
        'p[data-testid="JourneysTypography"] textarea[placeholder="Add your text here..."]'
      )
      .first()
      .clear()
    await this.page
      .frameLocator(this.journeyCardFrame)
      .first()
      .locator(
        'p[data-testid="JourneysTypography"] textarea[placeholder="Add your text here..."]'
      )
      .first()
      .fill(this.journeyName)
  }

  async clickDoneBtn() {
    await this.page
      .locator('button[data-testid="Fab"]', { hasText: 'Done' })
      .click()
  }

  async verifyTextAddedInJourneyCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"]',
          { hasText: this.journeyName }
        )
    ).toBeVisible()
  }

  async clickOnCreatedOrRenamedTextInJourneyCard(createdOrRenamed: string) {
    const text =
      createdOrRenamed === 'created' ? this.journeyName : this.renameJourmeyName
    await this.page
      .frameLocator(this.journeyCardFrame)
      .locator(
        'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"]',
        { hasText: text }
      )
      .dblclick({ delay: 3000 })
  }

  async editTextInJourneyCard() {
    this.renameJourmeyName =
      testData.journey.renameJourneyName + this.randomNumber
    await this.page
      .frameLocator(this.journeyCardFrame)
      .locator(
        'div[data-testid*="SelectableWrapper"] textarea[placeholder*="Add your text here"]'
      )
      .fill(this.renameJourmeyName)
  }

  async verifyTextUpdatedInJourneyCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"]',
          { hasText: this.renameJourmeyName }
        )
    ).toBeVisible()
  }

  async changeFontStyleInJourneyCardText(styleName) {
    await this.page
      .locator('div[data-testid="ToggleButtonGroupVariant"] button', {
        hasText: styleName
      })
      .click()
  }

  async verifyTextStyleChangedInJourneyCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"]',
          { hasText: this.renameJourmeyName }
        )
        .locator('h1')
    ).toBeVisible()
  }

  async clickDeleteBtnInToolTipBar() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator('div[role="tooltip"] button[id="delete-block-actions"]')
    ).toHaveCount(1, { timeout: 10000 })
    await this.page
      .frameLocator(this.journeyCardFrame)
      .locator('div[role="tooltip"] button[id="delete-block-actions"]')
      .click({ timeout: sixtySecondsTimeout, delay: 3000 })
  }

  async verifyAddedTextDeletedFromJourneyCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"]',
          { hasText: this.renameJourmeyName }
        )
    ).toBeHidden({ timeout: 10000 })
  }

  async waitUntilJourneyCardLoaded() {
    await expect(
      this.page.locator('div[data-testid="StrategyItem"] button')
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async clickSelectImageBtn() {
    await this.page
      .locator(
        'div[data-testid="ImageSource"] button[data-testid="card click area"]',
        { hasText: 'Select Image' }
      )
      .click()
  }

  async clickImageSelectionTab(tabName: string) {
    await this.page
      .locator('div[aria-label="image selection tabs"] button', {
        hasText: tabName
      })
      .click()
  }

  async uploadImageInCustomTab() {
    await this.page
      .locator('div[data-testid="ImageUpload"] input')
      .setInputFiles(testData.cardLevelAction.imgUploadPath)
    await expect(
      this.page.locator(
        'div[data-testid="ImageBlockHeader"] div[data-testid="ImageBlockThumbnail"] span[role="progressbar"]'
      )
    ).toBeHidden({ timeout: sixtySecondsTimeout })
  }

  async getImageSrc() {
    if (
      await this.page
        .locator(
          'div[data-testid="ImageSource"] + div div[data-testid="ImageBlockThumbnail"] img'
        )
        .isVisible()
    ) {
      this.uploadedImgSrc = await this.page
        .locator(
          'div[data-testid="ImageSource"] + div div[data-testid="ImageBlockThumbnail"] img'
        )
        .getAttribute('src')
    } else {
      this.uploadedImgSrc = ''
    }
  }

  async verifyImageGotChanged() {
    await expect(
      this.page.locator(
        'div[data-testid="ImageSource"] + div div[data-testid="ImageBlockThumbnail"] img'
      )
    ).not.toHaveAttribute('src', this.uploadedImgSrc, {
      timeout: sixtySecondsTimeout
    })
  }

  async verifyImgUploadedSuccessMsg() {
    await expect(
      this.page.locator('div[data-testid="ImageUpload"] p', {
        hasText: 'Upload successful!'
      })
    ).toBeVisible()
  }

  async clickImgFromFeatureOfGalleryTab() {
    await this.page
      .locator('ul[data-testid="UnsplashList"] li button')
      .first()
      .click()
    await expect(
      this.page.locator(
        'div[data-testid="ImageBlockHeader"] div[data-testid="ImageBlockThumbnail"] span[role="progressbar"]'
      )
    ).toBeHidden({ timeout: sixtySecondsTimeout })
  }

  async clickImgDeleteBtn() {
    await this.page
      .locator(
        'div[data-testid="ImageSource"] + div svg[data-testid="imageBlockHeaderDelete"]'
      )
      .click()
  }

  async verifyImageIsDeleted() {
    await expect(
      this.page.locator(
        'div[data-testid="ImageSource"] + div div[data-testid="ImageBlockThumbnail"] img'
      )
    ).toBeHidden({ timeout: sixtySecondsTimeout })
  }

  async clickSelectVideoBtn() {
    await this.page
      .locator(
        'div[data-testid="VideoBlockEditor"] button[data-testid="card click area"]'
      )
      .click()
  }

  async selectVideoTab(tabName) {
    await this.page
      .locator('div[data-testid="VideoLibrary"] button', { hasText: tabName })
      .click()
  }

  async uploadVideoInUploadTabOfVideoLibrary() {
    await this.page
      .locator('div[data-testid="VideoFromMux"] input')
      .setInputFiles(testData.cardLevelAction.videoUploadPath)
    await expect(
      this.page.locator(
        'div[data-testid="VideoFromMux"] span[role="progressbar"]'
      )
    ).toBeVisible({ timeout: sixtySecondsTimeout })
    await expect(
      this.page.locator(
        'div[data-testid="VideoFromMux"] span[role="progressbar"]'
      )
    ).toBeHidden({ timeout: sixtySecondsTimeout })
  }

  async verifyUploadVideoInJourney(uplodedType: string) {
    const videoName =
      uplodedType === 'created'
        ? testData.cardLevelAction.uploadVideoName
        : this.seletedVideo
    await expect(
      this.page.locator(
        'div[data-testid="VideoBlockEditor"] div[data-testid="ImageBlockThumbnail"] img[alt]'
      )
    ).toHaveAttribute('alt', videoName)
  }

  async clickVideoEditPenIcon() {
    await this.page
      .locator(
        'div[data-testid="VideoBlockEditor"] button[data-testid="card click area"]'
      )
      .click({ delay: 2000 })
  }

  async closeIconOfVideoDetails() {
    await expect(
      this.page
        .locator(
          'div[data-testid="SettingsDrawer"] + div[data-testid="SettingsDrawer"] div[class*="css-hhubed"]',
          { hasText: 'Video Details' }
        )
        .last()
    ).toBeVisible({ timeout: sixtySecondsTimeout })
    await this.page
      .locator(
        'div[data-testid="SettingsDrawer"] + div[data-testid="SettingsDrawer"] div[class*="css-hhubed"] +button[aria-label="close-image-library"]'
      )
      .click({ delay: 3000 })
    // verifying the video details page closed and if it is not, then click the 'X' button again in catch block
    /* eslint-disable playwright/missing-playwright-await */
    await expect(
      this.page
        .locator(
          'div[data-testid="SettingsDrawer"] + div[data-testid="SettingsDrawer"]',
          { has: this.page.locator('div[style*="visibility: hidden"]') }
        )
        .locator('div[class*="css-hhubed"]', { hasText: 'Video Details' })
    )
      .toHaveCount(1)
      .catch(async () => {
        await this.page
          .locator(
            'div[data-testid="SettingsDrawer"] + div[data-testid="SettingsDrawer"] div[class*="css-hhubed"] +button[aria-label="close-image-library"]'
          )
          .click({ delay: 3000 })
      })
  }

  async selectVideoFromLibraryTabOfVideoLibararyPage() {
    await this.page
      .locator('div[data-testid="VideoList"] div[data-testid*="VideoListItem"]')
      .first()
      .click()
  }

  async getVideoNameVideoFromLibraryTabOfVideoLibraryPage() {
    this.seletedVideo = await this.page
      .locator(
        'div[data-testid="VideoList"] div[data-testid*="VideoListItem"] span[class*="MuiListItemText-primary"]'
      )
      .first()
      .innerText()
  }

  async clickVideoDeleteIconInDrawer() {
    await this.page.locator('button[aria-label="clear-video"]').click()
  }

  async clickSelectBtnAfrerSelectingVideo() {
    await this.page.waitForTimeout(3000)
    await this.page
      .locator('//button[text()="Select"]', { hasText: 'Select' })
      .click({ delay: 3000, force: true })
  }

  async verifyVideoDeletedFromDrawer() {
    await expect(
      this.page.locator(
        'div[data-testid="VideoBlockEditor"] svg[data-testid="Edit2Icon"]'
      )
    ).toBeHidden({ timeout: sixtySecondsTimeout })
  }

  async clickleftSideArrawIcon() {
    await this.page
      .locator('div[slot="container-start"] svg[data-testid="ChevronLeftIcon"]')
      .click()
  }

  async hoverOnExistingCard() {
    await this.page.locator('div[data-testid="StepBlock"]').first().hover()
  }

  async getjourneyCardCount() {
    this.journeyCardSize = await this.page
      .locator('div[data-testid="StepBlock"]')
      .count()
  }

  async clicThreeDotOfCard() {
    await this.page.locator('button[data-testid="EditStepFab"]').click()
  }

  async clickDuplicateCard() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItemDuplicateStep"]')
      .click()
  }

  async clickDeleteCard() {
    await this.page
      .locator(
        'li[data-testid="JourneysAdminMenuItemDuplicateStep"] + li[data-testid="JourneysAdminMenuItem"]'
      )
      .click()
  }

  async deleteAllAddedCardProperties() {
    const properties = await this.page
      .frameLocator(this.journeyCardFrame)
      .locator(
        'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"]'
      )
      .count()
    console.log(`count ${properties}`)
    for (let property = 0; property < properties; property++) {
      await this.page
        .frameLocator(this.journeyCardFrame)
        .first()
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"]'
        )
        .last()
        .dblclick({ force: true, delay: 1500 })
      // Verifying whether the tooltip is displayed. If it is not, click the block again in catch block
      /* eslint-disable playwright/missing-playwright-await */
      await expect(
        this.page
          .frameLocator(this.journeyCardFrame)
          .locator('div[role="tooltip"] button[id="delete-block-actions"]')
          .first()
      )
        .toBeVisible()
        .catch(async () => {
          await this.page
            .frameLocator(this.journeyCardFrame)
            .first()
            .locator(
              'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"]'
            )
            .last()
            .dblclick()
        })

      await this.clickDeleteBtnInToolTipBar()
      await this.verifyToastMessage()
    }
  }

  async verifyToastMessage() {
    // await expect(this.page.locator('#notistack-snackbar')).toBeVisible({ timeout: 10000 })
    // await expect(this.page.locator('#notistack-snackbar')).toBeHidden({ timeout: sixtySecondsTimeout })
  }

  async verifyPollOptionAddedToCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOption"]'
        )
        .first()
    ).toBeVisible()
  }

  async clickOnPollOptionInCard(pollOption: number) {
    if (
      await this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid*="add-option"]'
        )
        .isVisible()
    ) {
      await this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOption"]'
        )
        .nth(pollOption - 1)
        .click()
    } else {
      await this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOption"]'
        )
        .nth(pollOption - 1)
        .click()
      await expect(
        this.page
          .frameLocator(this.journeyCardFrame)
          .locator(
            'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid*="add-option"]'
          )
      ).toHaveCount(1)
      await this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOption"]'
        )
        .nth(pollOption - 1)
        .click()
    }
  }

  async clickOnPollProperties() {
    if (
      await this.page
        .locator(
          'div[data-testid="RadioOptionProperties"] div[data-testid="AccordionSummary"][aria-expanded="false"]'
        )
        .isVisible()
    ) {
      await this.page
        .locator(
          'div[data-testid="RadioOptionProperties"] div[data-testid="AccordionSummary"]'
        )
        .click()
    }
    await this.page
      .locator('div[data-testid="Action"] div[aria-haspopup="listbox"]')
      .click()
  }

  async clickUrlOrWebSiteOptionInPollOptionProperties() {
    await this.page
      .locator('ul[role="listbox"] li[data-value="LinkAction"]')
      .click()
    await this.page.locator('input#link').fill(testData.cardLevelAction.url)
  }

  async renamedPollOptionInCard(pollOption: number) {
    this.pollRename = testData.cardLevelAction.pollRename + this.randomNumber
    if (
      await this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid*="add-option"]'
        )
        .isVisible()
    ) {
      await this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOption"]'
        )
        .nth(pollOption - 1)
        .dblclick()
    } else {
      await this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOption"]'
        )
        .nth(pollOption - 1)
        .click()
      await expect(
        this.page
          .frameLocator(this.journeyCardFrame)
          .locator(
            'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid*="add-option"]'
          )
      ).toBeVisible()
      await this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOption"]'
        )
        .nth(pollOption - 1)
        .dblclick()
    }
    await this.page
      .frameLocator(this.journeyCardFrame)
      .locator(
        'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOption"]'
      )
      .nth(pollOption - 1)
      .locator('textarea[name="radioOptionLabel"]')
      .fill(this.pollRename)
  }

  async verifyPollOptionGotRenamed() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOption"]',
          { hasText: this.pollRename }
        )
    ).toBeVisible()
  }

  async selectWholePollOptions() {
    // await this.page.frameLocator(this.journeyCardFrame).locator('div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid*="JourneysRadioQuestion"] button').first().click()
    await this.page
      .frameLocator(this.journeyCardFrame)
      .locator(
        'div[data-testid*="JourneysRadioQuestion"] div[role="group"] div:not([data-testid*="SelectableWrapper"])',
        { hasText: 'Add New Option' }
      )
      .click()
  }

  async verifyPollOptionsDeletedFromCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid*="JourneysRadioQuestion"]'
        )
    ).toBeHidden()
  }

  async verifyFeedBackAddedToCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid="JourneysTextResponse"]'
        )
        .first()
    ).toBeVisible()
  }

  async clickFeedBackPropertiesDropDown(feedBackProperty: string) {
    await expect(
      this.page.locator(
        'div[data-testid="TextResponseProperties"] div[data-testid="AccordionSummary"]',
        { hasText: feedBackProperty }
      )
    ).toBeVisible()
    if (
      await this.page
        .locator(
          'div[data-testid="TextResponseProperties"] div[data-testid="AccordionSummary"][aria-expanded="false"]',
          { hasText: feedBackProperty }
        )
        .isVisible()
    ) {
      await this.page
        .locator(
          'div[data-testid="TextResponseProperties"] div[data-testid="AccordionSummary"]',
          { hasText: feedBackProperty }
        )
        .click()
    } else {
      console.log('%s is already opened', feedBackProperty)
    }
  }

  async enterLabelBelowFeedBcakProperty() {
    await this.page.locator('input#label').click({ delay: 1000 })
    await this.page.locator('input#label').clear()
    await this.page
      .locator('input#label')
      .pressSequentially(testData.cardLevelAction.feedBackLabel, {
        timeout: 240000,
        delay: 300
      })
    // Added 2 sec timeout as a workaround to slow down the action
    await this.page.waitForTimeout(2000)
  }

  async enterHintBelowFeedBcakProperty() {
    await this.page
      .locator('input#hint')
      .fill(testData.cardLevelAction.feedBackHint)
    // Added 2 sec timeout as a workaround to slow down the action
    await this.page.waitForTimeout(2000)
  }

  async verifyLabelUpdatedIncard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid="JourneysTextResponse"]',
          { hasText: testData.cardLevelAction.feedBackLabel }
        )
    ).toBeVisible()
  }

  async verifyHintUpdatedInCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid="JourneysTextResponse"]',
          { hasText: testData.cardLevelAction.feedBackHint }
        )
    ).toBeVisible()
  }

  async clickActionOfFeedBackProperties() {
    await this.page
      .locator('div[data-testid="Action"] div[aria-haspopup="listbox"]')
      .click()
  }

  async selectEmailOptionInPrepertiesOptions() {
    await this.page
      .locator('ul[role="listbox"] li[data-value="EmailAction"]')
      .click()
    await this.page.locator('input#email').fill(testData.cardLevelAction.email)
  }

  async selectIconForProperties() {
    await this.page.locator('div[aria-label="icon-name"]').click()
    await this.page
      .locator(
        'ul[aria-labelledby="icon-name-select"] li[data-value="ChatBubbleOutlineRounded"]'
      )
      .click()
  }

  async verifySelectedIconInCardBelowFeedBack() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="JourneysTextResponse"] button svg[data-testid="ChatBubbleOutlineRoundedIcon"]'
        )
    ).toBeVisible()
  }

  async selectWholeFeedBackSection() {
    await this.page
      .frameLocator(this.journeyCardFrame)
      .locator(
        'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid="JourneysTextResponse"]'
      )
      .click()
  }

  async verifyFeedBackDeletedFromCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid="JourneysTextResponse"]'
        )
    ).toBeHidden()
  }

  async verifySubscribeAddedToCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid="JourneysSignUp"]'
        )
        .first()
    ).toBeVisible()
  }

  async clickOnSelectCardOptionInPrepertiesOptions() {
    await this.page
      .locator('ul[role="listbox"] li[data-value="NavigateToBlockAction"]')
      .click()
    await this.page
      .locator('div[data-testid="CardList"] div[data-testid*="CardItem"]')
      .first()
      .click()
  }

  async verifySelecetdIconInCardBelowSubscribe() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="JourneysSignUp"] button svg[data-testid="ChatBubbleOutlineRoundedIcon"]'
        )
        .first()
    ).toBeVisible()
  }

  async verifySubscribeDeletedFromCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid="JourneysSignUp"]'
        )
        .first()
    ).toBeHidden()
  }

  async selectWholeSubscribeSectionInCard() {
    await this.page
      .frameLocator(this.journeyCardFrame)
      .locator(
        'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid="JourneysSignUp"]'
      )
      .first()
      .click()
  }

  async clickPropertiesDropDown(feedBackProperty: string) {
    await this.page
      .locator(
        'div[data-testid="SignUpProperties"] div[data-testid="AccordionSummary"]',
        { hasText: feedBackProperty }
      )
      .click()
  }

  async clickSubscribePropertiesDropDown(feedBackProperty: string) {
    await this.page
      .locator(
        'div[data-testid="SignUpProperties"] div[data-testid="AccordionSummary"]',
        { hasText: feedBackProperty }
      )
      .click()
  }

  async selectWholeFooterSectionInCard() {
    await this.page
      .frameLocator(this.journeyCardFrame)
      .first()
      .locator(
        'div[data-testid="CardWrapper"] ~ div[data-testid="JourneysStepFooter"] > div'
      )
      .click({ delay: 3000 })
    // Verify whether the footer block is selected. If it is not, click the footer block again. in catch block
    /* eslint-disable playwright/missing-playwright-await */
    await expect(
      this.page.locator(
        'div[aria-labelledby*="hostedBy-tab"] div[data-testid="JourneysAdminContainedIconButton"] button'
      )
    )
      .toBeVisible()
      .catch(async () => {
        await this.page
          .frameLocator(this.journeyCardFrame)
          .first()
          .locator(
            'div[data-testid="CardWrapper"] ~ div[data-testid="JourneysStepFooter"] > div'
          )
          .dblclick({ force: true })
      })
  }

  async clicSelectHostBtn() {
    await this.page
      .locator(
        'div[data-testid="HostSelection"] div[data-testid="JourneysAdminContainedIconButton"] button'
      )
      .click()
  }

  async clickCreateNewBtn() {
    await this.page
      .locator('div[data-testid="HostList"] button', { hasText: 'Create New' })
      .click()
  }

  async enterHostName() {
    await this.page
      .locator('input#hostTitle')
      .fill(testData.cardLevelAction.hostName)
  }

  async enterLocation() {
    await this.page
      .locator('input#hostLocation')
      .click({ delay: 3000, force: true })
    await expect(this.page.locator('input#hostLocation')).toBeEnabled({
      timeout: sixtySecondsTimeout
    })
    await this.page.locator('input#hostLocation').click({ delay: 3000 })
    await this.page
      .locator('input#hostLocation')
      .fill(testData.cardLevelAction.location)
  }

  async verifyHostNameAddedInCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="StepFooterHostAvatars"] + div h6[data-testid="StepFooterHostTitleLocation"]',
          {
            hasText:
              testData.cardLevelAction.hostName +
              ' - ' +
              testData.cardLevelAction.location
          }
        )
    ).toBeHidden()
  }

  async expandJourneyAppearance(tabName: string) {
    await this.page
      .locator('div[data-testid="AccordionSummary"][aria-expanded="false"]', {
        hasText: tabName
      })
      .locator('div[class*="expandIconWrapper "]')
      .click()
  }

  async clickMessangerDropDown(messangerTitle: string) {
    await this.page
      .locator('div[data-testid="Chat"] div[data-testid="ChatOptionSummary"]', {
        hasText: messangerTitle
      })
      .locator('input[type="checkbox"]')
      .click()
  }

  async enterWhatsAppLink() {
    await this.page
      .locator('input#whatsApp')
      .fill(testData.cardLevelAction.whatsApp)
  }

  async verifyChatWidgetAddedToCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="StepFooterChatButtons"] svg[data-testid="WhatsAppIcon"]'
        )
    ).toBeVisible()
  }

  async verifyCardDeletedInCustomJournetPage() {
    await expect(this.page.locator('div[data-testid="StepBlock"]')).toBeHidden()
  }

  async verifyCardDuplicated() {
    await expect(this.page.locator('div[data-testid="StepBlock"]')).toHaveCount(
      this.journeyCardSize + 1
    )
  }

  async getJourneyName() {
    return this.journeyName
  }

  async editTextInJourneysTypographyField() {
    let typographyPath = ''
    let textareaPath = ''
    if (
      await this.page
        .frameLocator(this.journeyCardFrame)
        .first()
        .locator(
          'div[data-testid="CardWrapper"] div[data-testid*="SelectableWrapper"] h3[data-testid="JourneysTypography"]'
        )
        .first()
        .isVisible()
    ) {
      typographyPath =
        'div[data-testid="CardWrapper"] div[data-testid*="SelectableWrapper"] h3[data-testid="JourneysTypography"]'
      textareaPath = 'h3[data-testid="JourneysTypography"] textarea'
    } else {
      textareaPath = 'p[data-testid="JourneysTypography"] textarea'
      typographyPath =
        'div[data-testid="CardWrapper"] div[data-testid*="SelectableWrapper"] p[data-testid="JourneysTypography"]'
    }
    if (
      await this.page
        .frameLocator(this.journeyCardFrame)
        .first()
        .locator(typographyPath)
        .first()
        .isVisible()
    ) {
      await this.page
        .frameLocator(this.journeyCardFrame)
        .first()
        .locator(typographyPath)
        .first()
        .click({ timeout: sixtySecondsTimeout, delay: 1000 })
      for (let clickRetry = 0; clickRetry < 5; clickRetry++) {
        if (
          await this.page
            .frameLocator(this.journeyCardFrame)
            .first()
            .locator(textareaPath)
            .first()
            .isVisible()
        ) {
          break
        } else {
          await this.page
            .frameLocator(this.journeyCardFrame)
            .first()
            .locator(typographyPath)
            .first()
            .click({ timeout: sixtySecondsTimeout, delay: 1000 })
        }
      }
      await this.page
        .frameLocator(this.journeyCardFrame)
        .first()
        .locator(textareaPath)
        .first()
        .clear()
      await this.page
        .frameLocator(this.journeyCardFrame)
        .first()
        .locator(textareaPath)
        .first()
        .fill(this.journeyName)
    } else {
      await this.clickAddBlockBtn()
      await this.clickTextBtnInAddBlockDrawer()
      await this.enterTextInJourneysTypographyField()
      await this.clickDoneBtn()
      await this.verifyTextAddedInJourneyCard()
    }
  }

  async closeIconOfVideoDetailsIfAppear() {
    try {
      // veriying whether the video details page is appeared, if it is, clicking on the x icon (close btn)
      await expect(
        this.page.locator("//button[text()='Change Video']")
      ).toBeVisible({ timeout: 5000 })
      await this.page
        .locator(
          '//button[text()="Change Video"]//ancestor::div[@data-testid="SettingsDrawerContent"]/preceding-sibling::header//button[@aria-label="close-image-library"]'
        )
        .click({ delay: 3000 })
    } catch {
      /* empty */
    }
  }

  async deleteAllThePollOptions() {
    const pollOptionCount = await this.page
      .frameLocator(this.journeyCardFrame)
      .locator(
        'div[data-testid*="JourneysRadioQuestion"] div[role="group"] [data-testid*="SelectableWrapper"]'
      )
      .count()
    for (let poll = 0; poll < pollOptionCount; poll++) {
      await this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid*="JourneysRadioQuestion"] div[role="group"] [data-testid*="SelectableWrapper"]'
        )
        .last()
        .click()
      await this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid*="JourneysRadioQuestion"] div[role="group"] [data-testid*="SelectableWrapper"]'
        )
        .last()
        .click({ delay: 2000 })
      await this.clickDeleteBtnInToolTipBar()
      await this.verifyToastMessage()
    }
  }

  async moveLastCardToCenter() {
    const location = await this.page
      .locator('div[data-testid="SocialPreviewNode"]')
      .last()
      .boundingBox()
    if (location != null) {
      await this.page.mouse.move(
        location.x + location.width / 2,
        location.y + location.height / 2
      )
      await this.page.mouse.down({ button: 'left' })
      await this.page.waitForTimeout(1000)
      const analaytics = await this.page
        .locator('label[class*="MuiFormControlLabel"] h6')
        .last()
        .boundingBox()
      if (analaytics != null) {
        await this.page.mouse.move(
          analaytics.x + location.width / 2 + 100,
          analaytics.y + location.height / 2 + 100
        )
      }
      await this.page.waitForTimeout(1000)
      await this.page.mouse.up({ button: 'left' })
    } else {
      expect(location != null).toBeTruthy()
    }
  }

  async createNewCard() {
    const cardCount = await this.page
      .locator('div[data-testid="StepBlockNodeCard"]')
      .count()
    await this.page
      .locator('div[data-testid="StepBlockNodeCard"]')
      .last()
      .hover()
    const location = await this.page
      .locator('div[data-testid="BaseNodeRightHandle-show"] svg')
      .last()
      .boundingBox()
    if (location != null) {
      await this.page.mouse.move(
        location.x + location.width / 2,
        location.y + location.height / 2
      )
      await this.page.mouse.down({ button: 'left' })
      await this.page.waitForTimeout(1000)
      await this.page.mouse.move(
        location.x + location.width / 2 + 10,
        location.y + location.height / 2 + 10
      )
      await this.page.waitForTimeout(1000)
      await this.page.mouse.up({ button: 'left' })
    } else {
      expect(location != null).toBeTruthy()
    }
    await expect(
      this.page.locator('div[data-testid="StepBlockNodeCard"]')
    ).toHaveCount(cardCount + 1)
    await this.page.waitForTimeout(5000)
  }

  async moveLastCardToControlBtn() {
    const location = await this.page
      .locator('div[data-testid="StepBlockNodeCard"]')
      .last()
      .boundingBox()
    if (location != null) {
      await this.page.mouse.move(
        location.x + location.width / 2,
        location.y + location.height / 2
      )
      await this.page.mouse.down({ button: 'left' })
      await this.page.waitForTimeout(1000)
      const analaytics = await this.page
        .locator('div[class*="flow__controls bottom left"]')
        .boundingBox()
      if (analaytics != null) {
        await this.page.mouse.move(
          analaytics.x + location.width / 2 - 50,
          analaytics.y + location.height / 2 - 50
        )
      }
      await this.page.waitForTimeout(1000)
      await this.page.mouse.up({ button: 'left' })
    } else {
      expect(location != null).toBeTruthy()
    }
  }

  async connectTwoCardS() {
    const cardCount = await this.page
      .locator('div[data-testid="StepBlockNodeCard"]')
      .count()
    await this.page
      .locator('div[data-testid="StepBlockNodeCard"]')
      .nth(cardCount - 2)
      .hover()
    const location = await this.page
      .locator('div[data-testid="BaseNodeRightHandle-show"] svg')
      .nth(cardCount - 2)
      .boundingBox()
    if (location != null) {
      await this.page.mouse.move(
        location.x + location.width / 2,
        location.y + location.height / 2
      )
      await this.page.mouse.down({ button: 'left' })
      const connection = await this.page
        .locator(
          'div[data-testid="BaseNodeLeftHandle-show"][class*="connectablestart "]'
        )
        .first()
        .boundingBox()
      if (connection != null) {
        await this.page.mouse.move(
          connection.x + location.width / 2,
          connection.y + location.height / 2
        )
      } else {
        expect(connection != null).toBeTruthy()
      }
      await this.page.waitForTimeout(1000)
      await this.page.mouse.up({ button: 'left' })
    } else {
      expect(location != null).toBeTruthy()
    }
  }

  async updateMinimumRowsOptionFortextInput() {
    const textAreaPath = 'textarea#textResponse-field'
    await expect(
      this.page.frameLocator(this.journeyCardFrame).locator(textAreaPath)
    ).toHaveAttribute('style')
    const getStyleValue = await this.page
      .frameLocator(this.journeyCardFrame)
      .locator(textAreaPath)
      .getAttribute('style')
    const textAeaStyleBefore = getStyleValue ?? ''
    await this.page
      .getByTestId('ToggleButtonGroupMinRows')
      .locator('button:not([class *="Mui-selected"])')
      .last()
      .click({ timeout: 30000 })
    await expect(
      this.page.frameLocator(this.journeyCardFrame).locator(textAreaPath)
    ).not.toHaveAttribute('style', textAeaStyleBefore, { timeout: 30000 })
  }

  async verifyButtonAddedToCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator('button[data-testid="button-block"]')
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async verifyButtonRemovedFromCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator('button[data-testid="button-block"]')
    ).toBeHidden({ timeout: sixtySecondsTimeout })
  }

  async enterButtonNameInCard(buttonName: string) {
    await this.page
      .frameLocator(this.journeyCardFrame)
      .locator('button[data-testid="button-block"]')
      .fill(buttonName)
  }

  async clickButtonPropertyDropdown(propertyName: string) {
    await this.page
      .locator('div[data-testid="button-properties"] button', {
        hasText: propertyName
      })
      .click()
  }

  async chooseButtonColor(buttonColor: string) {
    await this.page
      .locator('div[role="listbox"] li', { hasText: buttonColor })
      .click()
  }

  async chooseButtonSize(buttonSize: string) {
    await this.page
      .locator('div[role="listbox"] li', { hasText: buttonSize })
      .click()
  }

  async chooseButtonVariant(buttonVariant: string) {
    await this.page
      .locator('div[role="listbox"] li', { hasText: buttonVariant })
      .click()
  }

  async clickIconDropdown() {
    await this.page
      .locator('div[data-testid="icon-dropdown"]')
      .click()
  }

  async chooseIconFromList(iconName: string) {
    await this.page
      .locator('div[role="listbox"] li', { hasText: iconName })
      .click()
  }

  async chooseColorForIcon(iconColor: string) {
    await this.page
      .locator('div[role="listbox"] li', { hasText: iconColor })
      .click()
  }

  async verifyButtonPropertyUpdatedInCard(buttonName: string) {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator('button[data-testid="button-block"]', { hasText: buttonName })
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async selectEmailOptionInPropertiesOptions() {
    await this.page
      .locator('div[role="listbox"] li', { hasText: 'Email' })
      .click()
  }

  async verifySpacerAddedToCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator('div[data-testid="spacer-block"]')
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async verifySpacerRemovedFromCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator('div[data-testid="spacer-block"]')
    ).toBeHidden({ timeout: sixtySecondsTimeout })
  }

  async getSpacerHeightPixelBeforeChange() {
    return await this.page
      .frameLocator(this.journeyCardFrame)
      .locator('div[data-testid="spacer-block"]')
      .getAttribute('height')
  }

  async validateSpacerHeightPixelGotChange(pixelHeightBeforeChange: any) {
    const currentHeight = await this.getSpacerHeightPixelBeforeChange()
    expect(currentHeight).not.toBe(pixelHeightBeforeChange)
  }

  async moveSpacerHeightTo() {
    await this.page
      .locator('input[type="range"]')
      .fill('50')
  }
}
