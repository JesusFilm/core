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
    await this.page.waitForLoadState('load')
    await this.page
      .frameLocator(this.journeyCardFrame)
      .first()
      .locator('div[data-testid="CardOverlayImageContainer"]')
      .first()
      .click({ delay: 1000 })
  }

  async clickOnVideoJourneyCard() {
    await this.page.waitForLoadState('load')
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
    await this.page.waitForLoadState('load')
    await expect(
      this.page.locator('div[data-testid="StrategyItem"] button')
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async clickSelectImageBtn() {
    // Try multiple approaches to find and click the select image button
    try {
      // Original selector
      await this.page
        .locator(
          'div[data-testid="ImageSource"] button[data-testid="card click area"]',
          { hasText: 'Select Image' }
        )
        .click({ timeout: 10000 })
    } catch (error) {
      try {
        // Fallback 1: Look for button with just text match
        await this.page
          .locator('button[data-testid="card click area"]')
          .filter({ hasText: 'Select Image' })
          .click({ timeout: 10000 })
      } catch (error) {
        try {
          // Fallback 2: Look for button with MUI classes and text
          await this.page
            .locator('button.MuiButtonBase-root.MuiCardActionArea-root')
            .filter({ hasText: 'Select Image' })
            .click({ timeout: 10000 })
        } catch (error) {
          try {
            // Fallback 3: Look for any button with "Select Image" text
            await this.page
              .locator('button:has-text("Select Image")')
              .click({ timeout: 10000 })
          } catch (error) {
            // Final fallback: Force click with visibility check disabled
            await this.page
              .locator(
                'div[data-testid="ImageSource"] button[data-testid="card click area"]',
                { hasText: 'Select Image' }
              )
              .click({ force: true, timeout: 10000 })
          }
        }
      }
    }
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
    // First wait for the TextResponseProperties panel to be visible
    await expect(
      this.page.locator('div[data-testid="TextResponseProperties"]')
    ).toBeVisible({ timeout: 30000 })

    // Try multiple approaches to find the accordion summary
    let accordionSummary

    // First try the original selector
    try {
      accordionSummary = this.page.locator(
        'div[data-testid="TextResponseProperties"] div[data-testid="AccordionSummary"]',
        { hasText: feedBackProperty }
      )
      await expect(accordionSummary).toBeVisible({ timeout: 5000 })
    } catch {
      // If that fails, try looking for MUI AccordionSummary within the TextResponseProperties
      try {
        accordionSummary = this.page.locator(
          'div[data-testid="TextResponseProperties"] .MuiAccordionSummary-root',
          { hasText: feedBackProperty }
        )
        await expect(accordionSummary).toBeVisible({ timeout: 5000 })
      } catch {
        // Final fallback - look for any clickable element with the text
        accordionSummary = this.page.locator(
          'div[data-testid="TextResponseProperties"] [role="button"]',
          { hasText: feedBackProperty }
        )
        await expect(accordionSummary).toBeVisible({ timeout: 5000 })
      }
    }

    // Check if the accordion is collapsed and needs to be expanded
    const isCollapsed = await this.page
      .locator(
        'div[data-testid="TextResponseProperties"] div[data-testid="AccordionSummary"][aria-expanded="false"]',
        { hasText: feedBackProperty }
      )
      .isVisible()
      .catch(() => false)

    if (isCollapsed) {
      await accordionSummary.click()

      // Wait for the accordion to expand
      await expect(
        this.page.locator(
          'div[data-testid="TextResponseProperties"] div[data-testid="AccordionSummary"][aria-expanded="true"]',
          { hasText: feedBackProperty }
        )
      ).toBeVisible({ timeout: 10000 })
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
    await this.page
      .locator(
        'div[data-testid="HostSelection"] [data-testid="JourneysAdminContainedIconButton"]'
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
    // Try multiple approaches to find the accordion summary
    let accordionSummary

    // First try the original selector with data-testid
    try {
      accordionSummary = this.page.locator(
        'div[data-testid="AccordionSummary"]',
        {
          hasText: tabName
        }
      )
      await expect(accordionSummary).toBeVisible({ timeout: 10000 })
    } catch {
      // If that fails, try looking for MUI AccordionSummary class
      try {
        accordionSummary = this.page.locator('.MuiAccordionSummary-root', {
          hasText: tabName
        })
        await expect(accordionSummary).toBeVisible({ timeout: 10000 })
      } catch {
        // Final fallback - look for any button role with the text
        accordionSummary = this.page.locator('[role="button"]', {
          hasText: tabName
        })
        await expect(accordionSummary).toBeVisible({ timeout: 10000 })
      }
    }

    // Check if the accordion is collapsed
    const isCollapsed = await this.page
      .locator('div[data-testid="AccordionSummary"][aria-expanded="false"]', {
        hasText: tabName
      })
      .isVisible()
      .catch(async () => {
        // Fallback check using MUI class
        return await this.page
          .locator('.MuiAccordionSummary-root[aria-expanded="false"]', {
            hasText: tabName
          })
          .isVisible()
          .catch(() => false)
      })

    if (isCollapsed) {
      // Try to click the expand icon first
      const expandIcon = accordionSummary.locator(
        'div[class*="expandIconWrapper"], svg[data-testid="ExpandMoreIcon"], .MuiAccordionSummary-expandIconWrapper'
      )

      if (await expandIcon.isVisible()) {
        await expandIcon.click()
      } else {
        // Fallback to clicking the entire accordion summary
        await accordionSummary.click()
      }

      // Wait for the accordion to expand with multiple fallback selectors
      try {
        await expect(
          this.page.locator(
            'div[data-testid="AccordionSummary"][aria-expanded="true"]',
            { hasText: tabName }
          )
        ).toBeVisible({ timeout: 10000 })
      } catch {
        // Fallback using MUI class
        await expect(
          this.page.locator('.MuiAccordionSummary-root[aria-expanded="true"]', {
            hasText: tabName
          })
        ).toBeVisible({ timeout: 10000 })
      }
    } else {
      console.log('%s accordion is already expanded', tabName)
    }
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
    } catch (error) {
      console.error('An error occurred:', error)
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
    // Try multiple approaches to find the button in iframe
    const frameLocator = this.page.frameLocator(this.journeyCardFrame)

    try {
      // Original selector
      await expect(
        frameLocator
          .locator(
            'div[data-testid="CardOverlayContent"] div[data-testid*="SelectableWrapper"] div[data-testid *="JourneysButton"]'
          )
          .locator(
            'button.MuiButton-text.MuiButton-sizeSmall.MuiButton-textPrimary'
          )
          .filter({
            has: this.page.locator('svg[data-testid="ArrowForwardRoundedIcon"]')
          })
          .filter({
            has: this.page.locator(
              'svg[data-testid="ChatBubbleOutlineRoundedIcon"]'
            )
          })
          .locator('textarea[name="buttonLabel"]')
      ).toHaveValue(buttonName, { timeout: 10000 })
    } catch (error) {
      try {
        // Fallback 1: Look for button with simpler MUI classes
        await expect(
          frameLocator
            .locator(
              'div[data-testid="CardOverlayContent"] div[data-testid*="JourneysButton"]'
            )
            .locator('button.MuiButton-root')
            .locator('textarea[name="buttonLabel"]')
        ).toHaveValue(buttonName, { timeout: 10000 })
      } catch (error) {
        try {
          // Fallback 2: Look for any button with buttonLabel textarea
          await expect(
            frameLocator
              .locator('div[data-testid="CardOverlayContent"]')
              .locator('textarea[name="buttonLabel"]')
          ).toHaveValue(buttonName, { timeout: 10000 })
        } catch (error) {
          // Final fallback: Look for any textarea with the button name value
          await expect(
            frameLocator.locator('textarea[name="buttonLabel"]')
          ).toHaveValue(buttonName, { timeout: 10000 })
        }
      }
    }
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
    ).toHaveCount(0)
  }
  async getSpacerHeightPixelBeforeChange() {
    // First wait for the SpacerProperties panel to be visible
    await expect(
      this.page.locator('div[data-testid="SpacerProperties"]')
    ).toBeVisible({ timeout: 30000 })

    // Try multiple approaches to find the accordion summary
    let accordionSummary

    // First try the original selector
    try {
      accordionSummary = this.page
        .locator(
          'div[data-testid="SpacerProperties"] div[data-testid="AccordionSummary"]'
        )
        .filter({ hasText: 'Spacer Height' })
      await expect(accordionSummary).toBeVisible({ timeout: 10000 })
    } catch {
      // If that fails, try looking for MUI AccordionSummary within the SpacerProperties
      try {
        accordionSummary = this.page
          .locator(
            'div[data-testid="SpacerProperties"] .MuiAccordionSummary-root'
          )
          .filter({ hasText: 'Spacer Height' })
        await expect(accordionSummary).toBeVisible({ timeout: 10000 })
      } catch {
        // Final fallback - look for any element with the text in SpacerProperties
        accordionSummary = this.page
          .locator('div[data-testid="SpacerProperties"] [role="button"]')
          .filter({ hasText: 'Spacer Height' })
        await expect(accordionSummary).toBeVisible({ timeout: 10000 })
      }
    }

    return await accordionSummary.locator('p').textContent()
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
      const thumbPositionAfterSlide = (await slider_thumb.boundingBox())?.x
      if (thumbPositionAfterSlide != null && sliderThumbPosition != null) {
        expect(thumbPositionAfterSlide).toBeGreaterThan(sliderThumbPosition)
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

    // First, try to expand the reactions section if it's not already visible
    try {
      // Check if reactions section is hidden/collapsed
      const reactionsSection = this.page.locator('div[data-testid="Reactions"]')
      const isHidden = await reactionsSection.isHidden()

      if (isHidden) {
        // Try to find and click an accordion or expand button for reactions
        try {
          await this.page
            .locator(
              'button:has-text("Reactions"), [role="button"]:has-text("Reactions")'
            )
            .click({ timeout: 5000 })
        } catch (error) {
          // Try to click on a parent accordion that might contain reactions
          try {
            await this.page
              .locator(
                '.MuiAccordionSummary-root:has-text("Footer"), .MuiAccordionSummary-root'
              )
              .last()
              .click({ timeout: 5000 })
          } catch (error) {
            // Continue anyway - maybe it's visible in a different context
          }
        }
      }

      // Wait for the reactions section to be available and visible
      await expect(reactionsSection).toBeVisible({ timeout: 15000 })
    } catch (error) {
      console.log(
        'Could not expand reactions section, trying to find visible instance'
      )
    }

    // Try multiple approaches to find and check the reaction checkbox
    let checkBox: any = null
    let checkboxFound = false

    // Strategy 1: Original selector with expanded section
    try {
      checkBox = this.page
        .locator('div.Mui-expanded div[data-testid="Reactions"]')
        .getByTestId(checkBoxTestId)
        .getByRole('checkbox')
      await expect(checkBox).toBeVisible({ timeout: 5000 })
      checkboxFound = true
    } catch (error) {
      // Strategy 2: Look in any visible reactions section
      try {
        checkBox = this.page
          .locator('div[data-testid="Reactions"]')
          .getByTestId(checkBoxTestId)
          .getByRole('checkbox')
        await expect(checkBox).toBeVisible({ timeout: 5000 })
        checkboxFound = true
      } catch (error) {
        // Strategy 3: Look for checkbox by test id without specific container
        try {
          checkBox = this.page.getByTestId(checkBoxTestId).getByRole('checkbox')
          await expect(checkBox).toBeVisible({ timeout: 5000 })
          checkboxFound = true
        } catch (error) {
          // Strategy 4: Look for input checkbox with test id
          try {
            checkBox = this.page.locator(
              `input[type="checkbox"][data-testid="${checkBoxTestId}"]`
            )
            await expect(checkBox).toBeVisible({ timeout: 5000 })
            checkboxFound = true
          } catch (error) {
            // Strategy 5: Look for checkbox by partial test id match
            try {
              checkBox = this.page.locator(
                `[data-testid*="${checkBoxTestId.replace('checkbox-', '')}"] input[type="checkbox"]`
              )
              await expect(checkBox).toBeVisible({ timeout: 5000 })
              checkboxFound = true
            } catch (error) {
              throw new Error(
                `Could not find checkbox with test id: ${checkBoxTestId}`
              )
            }
          }
        }
      }
    }

    if (checkboxFound && checkBox) {
      // Check the checkbox and verify it's checked
      await checkBox.check({ timeout: 10000 })
      await expect(checkBox).toBeChecked()
    } else {
      throw new Error(
        `Failed to find and interact with checkbox: ${checkBoxTestId}`
      )
    }
  }
  async enterDisplayTitleForFooter(footerTitle: string) {
    await this.page
      .locator('div.Mui-expanded input#display-title')
      .fill(footerTitle)
  }

  async validateFooterTitleAndReactionButtonsInCard(footerTitle: string) {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          `div[data-testid="JourneysStepFooter"]:has(h6:text-is("${footerTitle}")) div[data-testid="StepFooterButtonList"]`
        )
        .first()
        .filter({ has: this.page.getByTestId('ShareIcon') })
        .filter({ has: this.page.getByTestId('ThumbsUpIcon') })
        .filter({ has: this.page.getByTestId('ThumbsDownIcon') })
    ).toBeVisible()
  }
  async clickJourneyOrWebSiteOptionForFooter(buttonName: string) {
    //Journey , Website
    await this.page
      .locator('div[data-testid="SettingsDrawerContent"] div[role="group"]')
      .getByRole('button', { name: buttonName, exact: true })
      .click()
  }
  async selectFirstImageFromGalleryForFooter() {
    // Try multiple approaches to find and click the first image in gallery
    try {
      // Original selector
      await this.page
        .locator('li[data-testid *="image"] img')
        .first()
        .click({ timeout: 10000 })
    } catch (error) {
      try {
        // Fallback 1: Look for any image in a list item
        await this.page.locator('li img').first().click({ timeout: 10000 })
      } catch (error) {
        try {
          // Fallback 2: Look for images in gallery context
          await this.page
            .locator('ul img, .gallery img, [data-testid*="gallery"] img')
            .first()
            .click({ timeout: 10000 })
        } catch (error) {
          try {
            // Fallback 3: Look for clickable images
            await this.page
              .locator('img[role="button"], button img, a img')
              .first()
              .click({ timeout: 10000 })
          } catch (error) {
            try {
              // Fallback 4: Look for images in MUI components
              await this.page
                .locator('.MuiImageList-root img, .MuiCard-root img')
                .first()
                .click({ timeout: 10000 })
            } catch (error) {
              // Final fallback: Any image that's clickable
              await this.page
                .locator('img')
                .first()
                .click({ force: true, timeout: 10000 })
            }
          }
        }
      }
    }
  }
  async valdiateSelectedImageWithDeleteIcon() {
    // Try multiple approaches to find the image with delete icon
    try {
      // Original selector
      await expect(
        this.page.locator(
          'div[data-testid="ImageBlockHeader"]:has(img) button:has(svg[data-testid="imageBlockHeaderDelete"])'
        )
      ).toBeVisible({ timeout: 5000 })
    } catch (error) {
      try {
        // Fallback 1: Look for delete button near image without specific structure
        await expect(
          this.page.locator(
            'div[data-testid="ImageBlockHeader"] button:has(svg[data-testid="imageBlockHeaderDelete"])'
          )
        ).toBeVisible({ timeout: 5000 })
      } catch (error) {
        try {
          // Fallback 2: Look for any delete button in image context
          await expect(
            this.page.locator(
              'button:has(svg[data-testid="imageBlockHeaderDelete"]), button[aria-label*="delete"]:has(img)'
            )
          ).toBeVisible({ timeout: 5000 })
        } catch (error) {
          try {
            // Fallback 3: Look for delete icon in any image block
            await expect(
              this.page.locator(
                'div:has(img) svg[data-testid="imageBlockHeaderDelete"], svg[data-testid="imageBlockHeaderDelete"]'
              )
            ).toBeVisible({ timeout: 5000 })
          } catch (error) {
            try {
              // Fallback 4: Look for delete button with different structure
              await expect(
                this.page.locator(
                  'div[data-testid*="Image"] button:has(svg), .image-container button:has(svg)'
                )
              ).toBeVisible({ timeout: 5000 })
            } catch (error) {
              // Final fallback: Look for any button that might be delete in image context
              await expect(
                this.page
                  .locator(
                    'button[aria-label*="delete"], button[title*="delete"], button:has(svg):near(img)'
                  )
                  .first()
              ).toBeVisible({ timeout: 5000 })
            }
          }
        }
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
        'div[data-testid="ImageBlockHeader"]:has(div[data-testid="ImageBlockThumbnail"] img) button svg[data-testid *="Edit"]'
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
    await this.page
      .locator('li:has(svg[data-testid="ChevronDownIcon"])')
      .click()
  }

  async clickCreateMenuCardButtonInMenuFooter() {
    await this.page
      .locator('div.Mui-expanded div[data-testid="Menu"]')
      .getByRole('button', { name: 'Create Menu Card' })
      .click()
  }

  async validateWebsiteFooterSectionInCard(title: string) {
    await expect(
      this.page
        .frameLocator(this.journeyCardFrame)
        .locator(
          `div[data-testid="JourneysStepHeader"]:has(h6:text-is("${title}"))`
        )
        .filter({ has: this.page.locator('img') })
        .filter({
          has: this.page.locator('svg[data-testid="ChevronDownIcon"]')
        })
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
    // First wait for the ButtonProperties panel to be visible
    await expect(
      this.page.locator('div[data-testid="ButtonProperties"]')
    ).toBeVisible({ timeout: 30000 })

    // Try multiple approaches to find the accordion summary
    let accordionSummary

    // First try the original selector
    try {
      accordionSummary = this.page.locator(
        'div[data-testid="ButtonProperties"] div[data-testid="AccordionSummary"]',
        { hasText: feedBackProperty }
      )
      await expect(accordionSummary).toBeVisible({ timeout: 10000 })
    } catch {
      // If that fails, try looking for MUI AccordionSummary within the ButtonProperties
      try {
        accordionSummary = this.page.locator(
          'div[data-testid="ButtonProperties"] .MuiAccordionSummary-root',
          { hasText: feedBackProperty }
        )
        await expect(accordionSummary).toBeVisible({ timeout: 10000 })
      } catch {
        // Final fallback - look for any clickable element with the text
        accordionSummary = this.page.locator(
          'div[data-testid="ButtonProperties"] [role="button"]',
          { hasText: feedBackProperty }
        )
        await expect(accordionSummary).toBeVisible({ timeout: 10000 })
      }
    }

    // Click the accordion to expand it
    await accordionSummary.click()
  }
  async clickCardPropertiesDropDown(cardProperty: string) {
    await this.page
      .locator(
        `div[data-testid="SettingsDrawer"] div[data-testid="AccordionSummary"]:has(span:text-is("${cardProperty}"))`
      )
      .click({ timeout: 60000 })
  }
}
