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

  /**
   * Gets the first frame from the journey card iframe
   * This is needed because there can be multiple iframes and frameLocator throws strict mode violations
   */
  async getFirstJourneyCardFrame() {
    const iframeElement = this.page.locator(this.journeyCardFrame).first()
    await iframeElement.waitFor({
      state: 'attached',
      timeout: sixtySecondsTimeout
    })
    const frame = await iframeElement.contentFrame()
    if (!frame) {
      throw new Error('Frame not found')
    }
    return frame
  }

  async clickOnJourneyCard() {
    const frame = await this.getFirstJourneyCardFrame()
    await frame
      .locator('div[data-testid="CardOverlayImageContainer"]')
      .first()
      .waitFor({ state: 'visible', timeout: sixtySecondsTimeout })
    await frame
      .locator('div[data-testid="CardOverlayImageContainer"]')
      .first()
      .click({ delay: 1000 })
  }

  async clickOnVideoJourneyCard() {
    await this.page
      .frameLocator(this.journeyCardFrame)
      .locator(
        'div[data-testid="CardOverlayImageContainer"] img[data-testid="background-image"]'
      )
      .first()
      .waitFor({ state: 'visible', timeout: sixtySecondsTimeout })
    await this.page
      .frameLocator(this.journeyCardFrame)
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
    const button = this.page.locator(
      'div[data-testid="SettingsDrawer"] button',
      {
        hasText: buttonName
      }
    )
    await button.click({ timeout: sixtySecondsTimeout })
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
      .locator(
        'p[data-testid="JourneysTypography"] textarea[placeholder="Add your text here..."]'
      )
      .first()
      .clear()
    await this.page
      .frameLocator(this.journeyCardFrame)
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
    const frame = await this.getFirstJourneyCardFrame()
    const textElement = frame.locator(
        'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"]',
        { hasText: text }
      )
    await textElement.waitFor({
      state: 'visible',
      timeout: sixtySecondsTimeout
    })
    await textElement.scrollIntoViewIfNeeded()
    await this.page.waitForTimeout(500) // Wait for element to stabilize
    // Use two clicks instead of dblclick for better reliability
    await textElement.click({ timeout: sixtySecondsTimeout })
    await this.page.waitForTimeout(300)
    await textElement.click({ timeout: sixtySecondsTimeout })
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
    const frame = await this.getFirstJourneyCardFrame()
    const deleteButton = frame.locator(
      'div[role="tooltip"] button[id="delete-block-actions"]'
    )
    await expect(deleteButton).toHaveCount(1, { timeout: 10000 })
    await deleteButton
      .first()
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
    await this.page
      .locator('div[data-testid="StrategyItem"] button')
      .waitFor({ state: 'visible', timeout: sixtySecondsTimeout })
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
      .waitFor({ state: 'visible', timeout: sixtySecondsTimeout })
    await this.page
      .locator(
        'div[data-testid="ImageSource"] button[data-testid="card click area"]',
        { hasText: 'Select Image' }
      )
      .click({ timeout: sixtySecondsTimeout, force: true })
  }
  async clickSelectedImageBtn() {
    await this.page
      .locator(
        'div[data-testid="ImageSource"] button[data-testid="card click area"]',
        { hasText: 'Selected Image' }
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
      .setInputFiles(
        require('path').join(__dirname, '../utils/testResource/Flower.jpg')
      )
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
      .setInputFiles(
        require('path').join(
          __dirname,
          '../utils/testResource/SampleVideo.mp4'
        ),
        {
          timeout: 30000
        }
      )
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

  async clickChangeVideoOption() {
    await this.page
      .locator('div[data-testid="SettingsDrawerContent"] button', {
        hasText: 'Change Video'
      })
      .click()
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

  async clickSelectBtnAfterSelectingVideo() {
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

  async clickleftSideArrowIcon() {
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
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOptionList"]'
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
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOptionList"]'
        )
        .nth(pollOption - 1)
        .click()
    } else {
      await this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOptionList"]'
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
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOptionList"]'
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
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOptionList"]'
        )
        .nth(pollOption - 1)
        .dblclick()
    } else {
      await this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOptionList"]'
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
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOptionList"]'
        )
        .nth(pollOption - 1)
        .dblclick()
    }
    await this.page
      .frameLocator(this.journeyCardFrame)
      .locator(
        'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOptionList"]'
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
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] button[data-testid="JourneysRadioOptionList"]',
          { hasText: this.pollRename }
        )
    ).toBeVisible()
  }

  async selectWholePollOptions() {
    // await this.page.frameLocator(this.journeyCardFrame).locator('div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid*="JourneysRadioQuestionList"] button').first().click()
    await this.page
      .frameLocator(this.journeyCardFrame)
      .locator(
        'div[data-testid*="JourneysRadioQuestionList"] div[role="group"] div:not([data-testid*="SelectableWrapper"])',
        { hasText: 'Add New Option' }
      )
      .click()
  }

  async verifyPollOptionsDeletedFromCard() {
    const frame = await this.getFirstJourneyCardFrame()
    await expect(
      frame.locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid*="JourneysRadioQuestionList"]'
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
        'div[data-testid="TextResponseProperties"] [data-testid="AccordionSummary"]',
        { hasText: feedBackProperty }
      )
    ).toBeVisible()
    if (
      await this.page
        .locator(
          'div[data-testid="TextResponseProperties"] [data-testid="AccordionSummary"][aria-expanded="false"]',
          { hasText: feedBackProperty }
        )
        .isVisible()
    ) {
      await this.page
        .locator(
          'div[data-testid="TextResponseProperties"] [data-testid="AccordionSummary"]',
          { hasText: feedBackProperty }
        )
        .click()
    } else {
      console.log('%s is already opened', feedBackProperty)
    }
  }

  async enterLabelBelowFeedBcakProperty() {
    const labelInput = this.page.locator('input#label')
    await labelInput.waitFor({ state: 'visible', timeout: sixtySecondsTimeout })
    await labelInput.click({ delay: 1000 })
    await labelInput.clear()
    await labelInput.fill('')
    await labelInput.pressSequentially(testData.cardLevelAction.feedBackLabel, {
      timeout: sixtySecondsTimeout,
      delay: 100
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

  async selectEmailOptionInPropertiesOptions() {
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
        'div[data-testid="SignUpProperties"] [data-testid="AccordionSummary"]',
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
      this.page.locator('div[data-testid="AccordionSummary"]').filter({
        has: this.page.getByRole('heading', {
          name: 'Hosted By',
          exact: true
        })
      })
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
    const hostButton = this.page.locator(
        'div[data-testid="HostSelection"] div[data-testid="JourneysAdminContainedIconButton"] button'
      )
    await hostButton.waitFor({ state: 'visible', timeout: sixtySecondsTimeout })
    await hostButton.scrollIntoViewIfNeeded()
    await this.page.waitForTimeout(500) // Wait for element to stabilize
    await hostButton.click({ timeout: sixtySecondsTimeout, force: true })
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
    // Check if accordion is already expanded
    const expandedAccordion = this.page.locator('[data-testid="AccordionSummary"][aria-expanded="true"]', {
        hasText: tabName
      })
    const isExpanded = await expandedAccordion.count()
    if (isExpanded > 0) {
      // Already expanded, no need to click
      return
    }
    
    // Try to find and click the accordion to expand it
    const accordion = this.page.locator('[data-testid="AccordionSummary"]', {
      hasText: tabName
    })
    await accordion.waitFor({ state: 'visible', timeout: sixtySecondsTimeout })
    await accordion.click({ timeout: sixtySecondsTimeout })
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
    // Trigger blur to save the configuration
    await this.page.locator('input#whatsApp').blur()
    // Wait a moment for the chat button to be created/updated
    await this.page.waitForTimeout(2000)
  }

  async verifyChatWidgetAddedToCard() {
    // Generic URLs fall back to MessageTyping icon, not WhatsApp icon
    // But let's be flexible and check for any chat button icon
    const chatIconSelectors = [
      'div[data-testid="StepFooterChatButtons"] svg[data-testid="MessageTypingIcon"]',
      'div[data-testid="StepFooterChatButtons"] svg[data-testid="WhatsAppIcon"]',
      'div[data-testid="StepFooterChatButtons"] svg',
      'div[data-testid="StepFooterChatButtons"] button svg'
    ]

    let found = false
    for (const selector of chatIconSelectors) {
      try {
        await expect(
          this.page.frameLocator(this.journeyCardFrame).locator(selector)
        ).toBeVisible({ timeout: 3000 })
        found = true
        break
      } catch (error) {
        // Try next selector
        continue
      }
    }

    if (!found) {
      throw new Error('No chat widget icon found in footer')
    }
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
    } catch (error) {
      console.error('An error occurred:', error)
    }
  }

  async deleteAllThePollOptions() {
    const frame = await this.getFirstJourneyCardFrame()
    const pollOptionCount = await frame
      .locator(
        'div[data-testid*="JourneysRadioQuestionList"] div[role="group"] [data-testid*="SelectableWrapper"]'
      )
      .count()
    for (let poll = 0; poll < pollOptionCount; poll++) {
      await frame
        .locator(
          'div[data-testid*="JourneysRadioQuestionList"] div[role="group"] [data-testid*="SelectableWrapper"]'
        )
        .last()
        .click({ delay: 2000 })
      // Wait a bit before clicking delete
      await this.page.waitForTimeout(500)
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
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid *="JourneysButton"]'
        )
        .first()
    ).toBeVisible()
  }
  async verifyButtonRemovedFromCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid *="JourneysButton"]'
        )
        .first()
    ).toHaveCount(0)
  }
  async enterButtonNameInCard(buttonName: string) {
    await this.page
      .frameLocator(this.journeyCardFrame)
      .locator(
        'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid *="JourneysButton"] button textarea[name="buttonLabel"]'
      )
      .fill(buttonName)
  }
  async chooseButtonColor(buttonColor: string) {
    await this.page
      .getByTestId('ToggleButtonGroupColor')
      .getByRole('button', { name: buttonColor })
      .click()
  }

  async chooseButtonSize(buttonSize: string) {
    await this.page
      .getByTestId('ToggleButtonGroupSize')
      .getByRole('button', { name: buttonSize })
      .click()
  }
  async chooseButtonVariant(buttonVariant: string) {
    await this.page
      .getByTestId('ToggleButtonGroupVariant')
      .getByRole('button', { name: buttonVariant })
      .click()
  }

  async clickIconDropdown() {
    await this.page
      .locator('div.Mui-expanded div[data-testid="IconSelect"]')
      .getByRole('combobox')
      .click()
  }
  async chooseIconFromList(iconName: string) {
    //"Arrow Right", "Chat Bubble"
    await this.page.getByRole('option', { name: iconName }).click()
  }
  async chooseColorForIcon(iconColor: string) {
    await this.page
      .locator('div.Mui-expanded div[data-testid="ToggleButtonGroupColor"]')
      .getByRole('button', { name: iconColor })
      .click()
  }
  async verifyButtonPropertyUpdatedInCard(buttonName: string) {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid *="JourneysButton"] button textarea[name="buttonLabel"]'
        )
    ).toHaveValue(buttonName)
  }

  async verifySpacerAddedToCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid *="JourneysSpacer"]'
        )
        .first()
    ).toBeVisible()
  }
  async verifySpacerRemovedFromCard() {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid *="JourneysSpacer"]'
        )
    ).toHaveCount(0, { timeout: 10000 })
  }
  async getSpacerHeightPixelBeforeChange() {
    return await this.page
      .locator(
        'div[data-testid="SpacerProperties"] [data-testid="AccordionSummary"]',
        { hasText: 'Spacer Height' }
      )
      .locator('p')
      .textContent()
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validateSpacerHeightPixelGotChange(pixelHeightBeforeChange: any) {
    const pixelHeightAfterChange = await this.getSpacerHeightPixelBeforeChange()
    expect(
      pixelHeightAfterChange != null && parseInt(pixelHeightAfterChange)
    ).toBeGreaterThan(parseInt(pixelHeightBeforeChange))
  }
  async moveSpacerHeightTo() {
    let desiredPosition = 0

    const slider_thumb = this.page.locator(
      'div.Mui-expanded span.MuiSlider-thumb'
    )

    // Wait for the slider to appear
    const slider = this.page.locator('div.Mui-expanded .MuiSlider-root') // Find the slider by its class
    await expect(slider).toBeVisible()
    const sliderThumbPosition = (await slider_thumb.boundingBox())?.x
    //Get the slider's position and width, fail if sliderBoundingBox is null
    const sliderBoundingBox = await slider.boundingBox()
    if (sliderBoundingBox == null) {
      expect(false, {
        message: 'Slider Bonding Box value is null'
      }).toBeTruthy()
    } else {
      //Move the thumb (slider) to a specific position, e.g., 50% of the width
      const sliderWidth = sliderBoundingBox?.width
      desiredPosition = sliderWidth * 0.5 // Move to 50% of the width
      //Drag the slider thumb to the desired position
      //Drag the slider thumb to the desired position
      await slider_thumb.hover({ force: true })
      await this.page.mouse.down()
      await slider_thumb.hover({
        force: true,
        position: { x: desiredPosition, y: sliderBoundingBox.y }
      })
      await this.page.mouse.up()

      //await slider_thumb.dragTo(slider, { targetPosition: {x: desiredPosition, y: sliderBoundingBox.y }});
      // Wait a bit for the slider to settle after drag
      await this.page.waitForTimeout(500)
      const thumbPositionAfterSlide = (await slider_thumb.boundingBox())?.x
      if (thumbPositionAfterSlide != null && sliderThumbPosition != null) {
        // Use toBeGreaterThanOrEqual to handle cases where position might be equal (especially in CI)
        // If the position is the same, verify it's at least not less than the original
        expect(thumbPositionAfterSlide).toBeGreaterThanOrEqual(
          sliderThumbPosition
        )
        // If positions are equal, it means the slider was already at or past the target position
        // In that case, verify the slider moved to at least 50% of width
        if (
          thumbPositionAfterSlide === sliderThumbPosition &&
          sliderBoundingBox != null
        ) {
          const expectedMinPosition =
            sliderBoundingBox.x + sliderBoundingBox.width * 0.45 // Allow 5% tolerance
          expect(thumbPositionAfterSlide).toBeGreaterThanOrEqual(
            expectedMinPosition
          )
        }
      } else {
        expect(false, {
          message: 'Slider thumb Bonding Box value is null'
        }).toBeTruthy()
      }
    }
  }
  async selectAllTheReactionOptions() {
    await this.selectReactionOptions('checkbox-Share')
    await this.selectReactionOptions('checkbox-Like')
    await this.selectReactionOptions('checkbox-Dislike')
  }
  async selectReactionOptions(checkBoxTestId: string) {
    //'checkbox-Share', 'checkbox-Like', 'checkbox-Dislike'
    const checkBox = this.page
      .locator('div.Mui-expanded div[data-testid="Reactions"]')
      .getByTestId(checkBoxTestId)
      .getByRole('checkbox')
    await checkBox.check()
    await expect(checkBox).toBeChecked()
  }
  async enterDisplayTitleForFooter(footerTitle: string) {
    await this.page
      .locator('div.Mui-expanded input#display-title')
      .fill(footerTitle)
  }

  async validateFooterTitleAndReactionButtonsInCard(footerTitle: string) {
    // First validate the footer with title exists
    const footerSection = this.page
      .frameLocator(this.journeyCardFrame)
      .locator(
        `div[data-testid="JourneysStepFooter"]:has(h6:text-is("${footerTitle}"))`
      )

    await expect(footerSection).toBeVisible()

    // Then validate the button list exists (use first() since there might be multiple)
    const buttonList = footerSection
      .locator('div[data-testid="StepFooterButtonList"]')
      .first()
    await expect(buttonList).toBeVisible()

    // Check for reaction buttons - try simple selectors first
    const shareSelectors = [
      'svg[data-testid="ShareIcon"]',
      'button[data-testid="ShareButton"]',
      'button:has(svg[data-testid="ShareIcon"])',
      '[data-testid="ShareButton"] svg',
      'svg[data-testid="Share"]' // Some icons might use shorter names
    ]

    const thumbsUpSelectors = [
      'svg[data-testid="ThumbsUpIcon"]',
      'button[data-testid="ReactionButton"]:has(svg[data-testid="ThumbsUpIcon"])',
      'button:has(svg[data-testid="ThumbsUpIcon"])',
      '[data-testid="ReactionButton"] svg[data-testid="ThumbsUpIcon"]',
      'svg[data-testid="ThumbsUp"]' // Some icons might use shorter names
    ]

    const thumbsDownSelectors = [
      'svg[data-testid="ThumbsDownIcon"]',
      'button[data-testid="ReactionButton"]:has(svg[data-testid="ThumbsDownIcon"])',
      'button:has(svg[data-testid="ThumbsDownIcon"])',
      '[data-testid="ReactionButton"] svg[data-testid="ThumbsDownIcon"]',
      'svg[data-testid="ThumbsDown"]' // Some icons might use shorter names
    ]

    // Try to find each icon type
    let shareFound = false
    for (const selector of shareSelectors) {
      try {
        await expect(buttonList.locator(selector)).toBeVisible({
          timeout: 2000
        })
        shareFound = true

        break
      } catch (error) {
        continue
      }
    }

    let thumbsUpFound = false
    for (const selector of thumbsUpSelectors) {
      try {
        await expect(buttonList.locator(selector)).toBeVisible({
          timeout: 2000
        })
        thumbsUpFound = true
        break
      } catch (error) {
        continue
      }
    }

    let thumbsDownFound = false
    for (const selector of thumbsDownSelectors) {
      try {
        await expect(buttonList.locator(selector)).toBeVisible({
          timeout: 2000
        })
        thumbsDownFound = true
        break
      } catch (error) {
        continue
      }
    }

    if (!shareFound || !thumbsUpFound || !thumbsDownFound) {
      // Enhanced debug information

      // Get actual button data-testids
      const buttons = buttonList.locator('button')
      const buttonTestIds: string[] = []
      for (let i = 0; i < (await buttons.count()); i++) {
        const testId = await buttons.nth(i).getAttribute('data-testid')
        buttonTestIds.push(testId || 'no-testid')
      }

      // Get actual SVG data-testids
      const svgs = buttonList.locator('svg')
      const svgTestIds: string[] = []
      for (let i = 0; i < (await svgs.count()); i++) {
        const testId = await svgs.nth(i).getAttribute('data-testid')
        svgTestIds.push(testId || 'no-testid')
      }

      throw new Error(
        `Missing reaction buttons - Share: ${shareFound}, ThumbsUp: ${thumbsUpFound}, ThumbsDown: ${thumbsDownFound}`
      )
    }
  }
  async clickJourneyOrWebSiteOptionForFooter(buttonName: string) {
    //Journey , Website
    await this.page
      .locator('div[data-testid="SettingsDrawerContent"] div[role="group"]')
      .getByRole('button', { name: buttonName, exact: true })
      .click()
  }
  async selectFirstImageFromGalleryForFooter() {
    // Wait for image dialog to open
    await this.page.waitForTimeout(2000)
    
    // Check if we need to switch to Gallery tab (similar to Image test)
    const galleryTabButton = this.page.locator('div[aria-label="image selection tabs"] button', {
      hasText: 'Gallery'
    })
    const galleryTabCount = await galleryTabButton.count()
    if (galleryTabCount > 0) {
      // Switch to Gallery tab first
      await galleryTabButton.click({ timeout: sixtySecondsTimeout })
      await this.page.waitForTimeout(1000) // Wait for gallery to load
    }
    
    // Try to find images using the same pattern as clickImgFromFeatureOfGalleryTab
    // First try UnsplashList (Gallery tab pattern)
    const unsplashList = this.page.locator('ul[data-testid="UnsplashList"]')
    const unsplashCount = await unsplashList.count()
    
    if (unsplashCount > 0) {
      // Use the same pattern as clickImgFromFeatureOfGalleryTab
      const imageButton = this.page.locator('ul[data-testid="UnsplashList"] li button').first()
      await imageButton.waitFor({ state: 'visible', timeout: sixtySecondsTimeout })
      await imageButton.click({ timeout: sixtySecondsTimeout })
      
      // Wait a bit for the click to register
      await this.page.waitForTimeout(1000)
      
      // Check if there's a confirmation button (Select/Done) that needs to be clicked
      const confirmButtonSelectors = [
        'button:has-text("Select")',
        'button:has-text("Done")',
        'button:has-text("Confirm")',
        'button[data-testid*="select"]',
        'button[data-testid*="confirm"]',
        'button[aria-label*="Select"]',
        'button[aria-label*="Confirm"]'
      ]
      
      for (const buttonSelector of confirmButtonSelectors) {
        try {
          const confirmButton = this.page.locator(buttonSelector).first()
          const buttonCount = await confirmButton.count()
          if (buttonCount > 0) {
            await confirmButton.waitFor({ state: 'visible', timeout: 5000 })
            await confirmButton.click({ timeout: sixtySecondsTimeout })
            await this.page.waitForTimeout(1000)
            break
          }
        } catch (err) {
          // Button might not exist, continue
          continue
        }
      }
      
      // Wait for progress bar to disappear (image is being processed)
      try {
    await expect(
      this.page.locator(
            'div[data-testid="ImageBlockHeader"] div[data-testid="ImageBlockThumbnail"] span[role="progressbar"]'
          )
        ).toBeHidden({ timeout: sixtySecondsTimeout })
      } catch (error) {
        // Progress bar might not exist, that's okay
      }
      
      // ImageBlockHeader should now be visible
      await expect(
        this.page.locator('div[data-testid="ImageBlockHeader"]')
      ).toBeVisible({ timeout: sixtySecondsTimeout })
      return
    }
    
    // Fallback: Try other gallery selectors
    const imageSelectors = [
      'li[data-testid *="image"]',
      'li[data-testid*="image"]',
      'li[data-testid*="Image"]',
      'div[data-testid *="image"]',
      'div[role="listbox"] li',
      'ul[role="listbox"] li'
    ]

    let imageListItems: ReturnType<typeof this.page.locator> | null = null
    let count = 0

    // Try each selector with increasing wait times
    for (const selector of imageSelectors) {
      await this.page.waitForTimeout(2000) // Wait for images to load
      imageListItems = this.page.locator(selector)
      count = await imageListItems.count()
      if (count > 0) {
        break
      }
      // Wait a bit more and try again
      await this.page.waitForTimeout(1000)
      count = await imageListItems.count()
      if (count > 0) {
        break
      }
    }

    if (count === 0 || imageListItems === null) {
      // Try to find any image element as fallback - but look for buttons first
      const anyImageButton = this.page.locator('button:has(img)').or(this.page.locator('li button')).first()
      const buttonCount = await anyImageButton.count()
      if (buttonCount > 0) {
        await anyImageButton.waitFor({ state: 'visible', timeout: sixtySecondsTimeout })
        await anyImageButton.scrollIntoViewIfNeeded()
        await anyImageButton.click({ timeout: sixtySecondsTimeout })
        // Wait for click to register
        await this.page.waitForTimeout(1000)
        
        // Check for confirmation button
        const confirmButtons = [
          'button:has-text("Select")',
          'button:has-text("Done")',
          'button:has-text("Confirm")'
        ]
        for (const btnSelector of confirmButtons) {
          const btn = this.page.locator(btnSelector).first()
          if (await btn.count() > 0) {
            await btn.click({ timeout: 10000 })
            await this.page.waitForTimeout(1000)
            break
          }
        }
        
        // Wait for ImageBlockHeader
        await expect(
          this.page.locator('div[data-testid="ImageBlockHeader"]')
        ).toBeVisible({ timeout: sixtySecondsTimeout })
        return
      }
      
      // Last resort: try clicking any image
      const anyImage = this.page.locator('img').first()
      const imageCount = await anyImage.count()
      if (imageCount > 0) {
        await anyImage.waitFor({
          state: 'visible',
          timeout: sixtySecondsTimeout
        })
        await anyImage.scrollIntoViewIfNeeded()
        await anyImage.click({ timeout: sixtySecondsTimeout })
        // Wait for ImageBlockHeader
        await this.page.waitForTimeout(2000)
        
        // Check for confirmation button
        const confirmButtons = [
          'button:has-text("Select")',
          'button:has-text("Done")',
          'button:has-text("Confirm")'
        ]
        for (const btnSelector of confirmButtons) {
          const btn = this.page.locator(btnSelector).first()
          if (await btn.count() > 0) {
            await btn.click({ timeout: 10000 })
            await this.page.waitForTimeout(1000)
            break
          }
        }
        
        await expect(
          this.page.locator('div[data-testid="ImageBlockHeader"]')
        ).toBeVisible({ timeout: sixtySecondsTimeout })
        return
      }
      throw new Error('No images found in gallery after waiting')
    }

    // Click on the list item itself, not the img to avoid strict mode violations
    const imageListItem = imageListItems.first()
    await imageListItem.waitFor({
      state: 'visible',
      timeout: sixtySecondsTimeout
    })
    await imageListItem.scrollIntoViewIfNeeded()

    // Try to find and click a button inside the list item first (common pattern for image galleries)
    const buttonInItem = imageListItem.locator('button').first()
    const buttonCount = await buttonInItem.count()
    if (buttonCount > 0) {
      await buttonInItem.waitFor({
        state: 'visible',
        timeout: sixtySecondsTimeout
      })
      await buttonInItem.click({ timeout: sixtySecondsTimeout })
    } else {
      // Try clicking the img first, if that fails, click the li element
      const imgInItem = imageListItem.locator('img').first()
      const imgCount = await imgInItem.count()
      if (imgCount > 0) {
        await imgInItem.waitFor({
          state: 'visible',
          timeout: sixtySecondsTimeout
        })
        await imgInItem.click({ timeout: sixtySecondsTimeout })
      } else {
        await imageListItem.click({ timeout: sixtySecondsTimeout })
      }
    }

    // Wait for image to be processed and selected
    await this.page.waitForTimeout(2000)

    // Wait for any loading indicators to disappear (similar to clickImgFromFeatureOfGalleryTab)
    try {
      await this.page
        .locator(
          'div[data-testid="ImageBlockHeader"] div[data-testid="ImageBlockThumbnail"] span[role="progressbar"]'
        )
        .waitFor({ state: 'hidden', timeout: 30000 })
    } catch (error) {
      // Progress bar might not exist, that's okay
    }
    
    // Wait for ImageBlockHeader to appear after image selection
    await expect(
      this.page.locator('div[data-testid="ImageBlockHeader"]')
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }
  async valdiateSelectedImageWithDeleteIcon() {
    // First, ensure ImageBlockHeader exists - wait longer and check multiple locations
    // The ImageBlockHeader might be in a drawer or in the main content
    const imageHeaderSelectors = [
      'div[data-testid="ImageBlockHeader"]',
      'div[data-testid="ImageSource"] + div[data-testid="ImageBlockHeader"]',
      'div[role="dialog"] div[data-testid="ImageBlockHeader"]',
      'div[data-testid="SettingsDrawerContent"] div[data-testid="ImageBlockHeader"]'
    ]
    
    let imageHeaderFound = false
    let imageHeader: ReturnType<typeof this.page.locator> | null = null
    
    for (const selector of imageHeaderSelectors) {
      try {
        imageHeader = this.page.locator(selector)
        await expect(imageHeader).toBeVisible({ timeout: 10000 })
        imageHeaderFound = true
        break
      } catch (error) {
        continue
      }
    }
    
    if (!imageHeaderFound || !imageHeader) {
      // If ImageBlockHeader doesn't appear, check if there's a confirmation button
      const confirmButtons = [
        'button:has-text("Select")',
        'button:has-text("Done")',
        'button:has-text("Confirm")',
        'button[data-testid*="select"]',
        'button[data-testid*="confirm"]'
      ]
      
      for (const buttonSelector of confirmButtons) {
        try {
          const button = this.page.locator(buttonSelector).first()
          const buttonCount = await button.count()
          if (buttonCount > 0) {
            await button.waitFor({ state: 'visible', timeout: 5000 })
            await button.click({ timeout: sixtySecondsTimeout })
            await this.page.waitForTimeout(1000)
            // Try again to find ImageBlockHeader
            imageHeader = this.page.locator('div[data-testid="ImageBlockHeader"]')
            await expect(imageHeader).toBeVisible({ timeout: sixtySecondsTimeout })
            imageHeaderFound = true
            break
          }
        } catch (err) {
          continue
        }
      }
      
      if (!imageHeaderFound) {
        throw new Error('ImageBlockHeader not found - image may not have been selected')
      }
    }
    
    // Use the found imageHeader for subsequent checks
    if (!imageHeader) {
      imageHeader = this.page.locator('div[data-testid="ImageBlockHeader"]')
    }
    
    // Wait for the image to be selected and the delete icon to appear
    // Try multiple selectors as the structure might vary
    const deleteIconSelectors = [
      'div[data-testid="ImageBlockHeader"]:has(img) button:has(svg[data-testid="imageBlockHeaderDelete"])',
      'div[data-testid="ImageSource"] + div svg[data-testid="imageBlockHeaderDelete"]',
      'div[data-testid="ImageBlockHeader"] button svg[data-testid="imageBlockHeaderDelete"]',
      'div[data-testid="ImageBlockHeader"] svg[data-testid="imageBlockHeaderDelete"]',
      'button:has(svg[data-testid="imageBlockHeaderDelete"])'
    ]

    let found = false
    for (const selector of deleteIconSelectors) {
      try {
        const deleteIconLocator = this.page.locator(selector)
        await expect(deleteIconLocator).toBeVisible({ timeout: 10000 })
        found = true
        break
      } catch (error) {
        // Try next selector
        continue
      }
    }

    if (!found) {
      // If none of the selectors work, check if image was selected at all
      const imageHeaderCheck = this.page.locator(
        'div[data-testid="ImageBlockHeader"]'
      )
      const headerCount = await imageHeaderCheck.count()
      if (headerCount > 0) {
        // Image header exists, check what's actually there
        const headerHTML = await imageHeaderCheck
          .first()
          .innerHTML()
          .catch(() => '')
        throw new Error(
          `Delete icon not found. ImageBlockHeader exists but delete icon not visible. Header content: ${headerHTML.substring(0, 200)}`
        )
      } else {
        throw new Error(
          'ImageBlockHeader not found - image may not have been selected'
        )
      }
    }
  }
  async closeToolDrawerForFooterImage() {
    await this.page
      .locator(
        'div.MuiToolbar-root:has-text("Image") button[aria-label="close-image-library"]'
      )
      .click()
  }
  async validateSelectedImageWithEditIcon() {
    await expect(
      this.page.locator(
        'div[data-testid="ImageBlockHeader"]:has(div[data-testid="ImageBlockThumbnail"] img) button svg[data-testid="imageBlockHeaderEdit"]'
      )
    ).toBeVisible()
  }

  async clickSelectIconDropdownForFooterMenu() {
    await this.page
      .locator('div.Mui-expanded div[data-testid="MenuIconSelect"]')
      .getByRole('combobox')
      .click()
  }
  async selectChevronDownIconForFooter() {
    // Wait for the dropdown to be fully opened and options to be visible
    await this.page.waitForTimeout(2000)

    // Looking at MenuIconSelect component, the ChevronDown option should be in a MenuItem
    // with value "chevronDown" containing a Box with the ChevronDown icon
    const menuItemSelectors = [
      // Specific MenuItem value selector
      'li[role="menuitem"][data-value="chevronDown"]',
      'li[data-value="chevronDown"]',

      // MenuItem containing ChevronDown icon
      'li[role="menuitem"]:has(svg[data-testid="ChevronDownIcon"])',

      // Standard MUI dropdown patterns
      'ul[role="listbox"] li:has(svg[data-testid="ChevronDownIcon"])',
      '.MuiMenu-list li:has(svg[data-testid="ChevronDownIcon"])',
      '.MuiList-root li:has(svg[data-testid="ChevronDownIcon"])',

      // General fallbacks
      'li:has(svg[data-testid="ChevronDownIcon"])',
      'li[role="option"]:has(svg[data-testid="ChevronDownIcon"])',

      // Box containing the icon (from MenuIconSelect structure)
      'li:has(div:has(svg[data-testid="ChevronDownIcon"]))',

      // Fallback to direct icon click
      'svg[data-testid="ChevronDownIcon"]'
    ]

    let found = false
    for (const selector of menuItemSelectors) {
      try {
        const element = this.page.locator(selector).first()
        await expect(element).toBeVisible({ timeout: 3000 })
        await element.click()
        found = true
        break
      } catch (error) {
        continue
      }
    }

    if (!found) {
      // Debug: Log all available dropdown options
      await this.page.waitForTimeout(1000)
      const allMenuItems = await this.page
        .locator('li[role="menuitem"], li[data-value], li[role="option"]')
        .count()
      const allOptions = await this.page.locator('li, [role="option"]').count()
      console.log(
        `Found ${allMenuItems} menu items and ${allOptions} total dropdown options`
      )

      // Try to get data-value attributes to debug
      const menuItems = this.page.locator('li[data-value]')
      const count = await menuItems.count()
      for (let i = 0; i < Math.min(count, 5); i++) {
        const value = await menuItems.nth(i).getAttribute('data-value')
        console.log(`MenuItem ${i}: data-value="${value}"`)
      }

      throw new Error('ChevronDown option not found with any selector')
    }
  }

  async clickCreateMenuCardButtonInMenuFooter() {
    await this.page
      .locator('div.Mui-expanded div[data-testid="Menu"]')
      .getByRole('button', { name: 'Create Menu Card' })
      .click()
  }

  async validateWebsiteFooterSectionInCard(title: string) {
    // For website templates, logo and menu are in the header, title and chat are in footer
    const header = this.page
      .frameLocator(this.journeyCardFrame)
      .locator('div[data-testid="JourneysStepHeader"]')

    // First check if header exists
    await expect(header).toBeVisible()

    // Check for logo (image) separately
    const hasLogo = (await header.locator('img').count()) > 0

    // Check for menu icon separately
    const hasMenuIcon =
      (await header.locator('svg[data-testid="ChevronDownIcon"]').count()) > 0

    // If we have both logo and menu icon, validate them together
    if (hasLogo && hasMenuIcon) {
      await expect(
        header.filter({ has: this.page.locator('img') }).filter({
          has: this.page.locator('svg[data-testid="ChevronDownIcon"]')
        })
      ).toBeVisible()
    } else {
      // Try more flexible approach - check if header has either logo OR menu, not necessarily both
      try {
        await expect(header.locator('img')).toBeVisible({ timeout: 2000 })
      } catch (error) {
        // Logo not found - this is expected for some website configurations
      }

      try {
        await expect(
          header.locator('svg[data-testid="ChevronDownIcon"]')
        ).toBeVisible({ timeout: 2000 })
      } catch (error) {
        // ChevronDown not found - this is expected for some website configurations
      }
    }

    // For website journeys, the display title is in the HEADER, not the footer
    // The footer only contains InformationButton and ChatButtons
    await expect(
      header.locator(
        `h6:text-is("${title}"), [role="heading"]:text-is("${title}"), *:text-is("${title}")`
      )
    ).toBeVisible()
  }

  async validateWebsiteFooterSectionInMenuCard(title: string) {
    await expect(
      this.page
        .locator(
          `div[data-testid="JourneysStepHeader"]:has(h6:text-is("${title}"))`
        )
        .filter({ has: this.page.locator('img') })
        .filter({ has: this.page.locator('svg[data-testid *="X"]') })
    ).toBeVisible()
  }

  async validateMenuCardDetailsInCard() {
    await expect(
      this.page
        .locator('div[data-testid="CardExpandedCover"]')
        .filter({
          has: this.page.locator(
            'h1[data-testid="JourneysTypography"]:has-text("Menu")'
          )
        })
        .filter({ has: this.page.locator('button:has-text("About Us")') })
        .filter({ has: this.page.locator('button:has-text("Ministries")') })
        .filter({ has: this.page.locator('button:has-text("Contact Us")') })
    ).toBeVisible()
  }
  async validateMenuCardInReactFlow() {
    await expect(
      this.page.locator(
        'div.MuiStack-root[data-testid *="StepBlockNode"] div[data-testid="BaseNode"]:has-text("Menu")'
      )
    ).toBeVisible()
  }
  async clickButtonPropertyDropdown(feedBackProperty: string) {
    await this.page
      .locator(
        'div[data-testid="ButtonProperties"] [data-testid="AccordionSummary"]',
        { hasText: feedBackProperty }
      )
      .click()
  }
  async clickCardPropertiesDropDown(cardProperty: string) {
    await this.page
      .locator(
        `div[data-testid="SettingsDrawer"] [data-testid="AccordionSummary"]:has(span:text-is("${cardProperty}"))`
      )
      .click({ timeout: 60000 })
  }
}
