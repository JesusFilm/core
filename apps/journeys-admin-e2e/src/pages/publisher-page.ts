/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import dayjs from 'dayjs'
import { Page } from 'playwright-core'

import testData from '../utils/testData.json'

const thirtySecondsTimeout = 30000
const fifteenSecondsTimeout = 15000

let journeyName = ''
let randomNumber = ''
export class AssessmentPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
    randomNumber =
      dayjs().format('DDMMYY-hhmmss') +
      Math.floor(Math.random() * (100 - 999 + 1) + 999)
  }

  async createAndVerifyCustomJourney() {
    await this.enterJourneysTypography()
    await this.clickDoneBtn()
    await this.clickThreeDotBtnOfCustomJourney()
    await this.clickTitleInThreeDotOptions()
    await this.enterTitle()
    await this.clickSaveBtn()
    await this.backIcon()
    await this.verifyCreatedCustomJourneyInActiveList()
  }

  async createAndVerifyTemplate() {
    await this.clickOnTheCreatedCustomJourney()
    await this.clickThreeDotBtnOfCustomJourney()
    await this.clickTheCreateTempleteOption()
    await this.backIcon()
    await this.verifyCreatedJourneyInTemplateList()
  }

  async verifyCreatedNewTemplateMovedToArchivedTab() {
    await this.clickThreeDotOfCreatedNewTemple()
    await this.clickArchiveOption()
    await this.clickArchivedTab()
    await this.verifyCreatedNewTemplateMovedToArchiveOrNot()
  }

  async verifyCreatedNewTemplateMovedToTrashTab() {
    await this.clickThreeDotOfCreatedNewTemple()
    await this.clickTrashOption()
    await this.clickDeleteBtn()
    await this.clickTrashTab()
    await this.verifyCreatedNewTemplateMovedToTrashTabOrNot()
  }

  async verifyCreatedNewTemplateDetetedForever() {
    await this.clickThreeDotOfCreatedNewTemple()
    await this.clickDeleteForeverOption()
    await this.clickDeleteBtn()
    await this.verifyCreatedNewTemplateRemovedFromTrashTabOrNot()
  }

  async navigateToDiscoverPage() {
    await expect(
      this.page.locator('a[data-testid="NavigationListItemDiscover"]')
    ).toBeVisible()
    await this.page
      .locator('a[data-testid="NavigationListItemDiscover"]')
      .click()
    await expect(
      this.page.locator(
        'a[data-testid="NavigationListItemDiscover"][class*="Mui-selected"]'
      )
    ).toBeVisible({ timeout: fifteenSecondsTimeout })
  }

  async verifyCreatedJourneyMovedToTrash() {
    await this.clickThreeDotOfCreatedNewJourney()
    await this.clickTrashOption()
    await this.clickDeleteBtn()
    await this.clickTrashTab()
    await this.verifyCreatedNewJourneyMovedToTrashTabOrNot()
  }

  async verifyCreatedNewJourneyRestored() {
    await this.clickThreeDotOfCreatedNewJourney()
    await this.clickTheRestore()
    await this.clickRestoreBtn()
    await this.clickActiveTab()
    await this.verifyCreatedNewJourneyMovedToActiveTabOrNot()
  }

  async clickCreateCustomJourney(): Promise<void> {
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminContainedIconButton"] button'
      )
    ).toBeVisible({ timeout: fifteenSecondsTimeout })
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminImageThumbnail"] span[class*="MuiCircularProgress"]'
      )
    ).toBeHidden({ timeout: fifteenSecondsTimeout })
    await this.page
      .locator('div[data-testid="JourneysAdminContainedIconButton"] button')
      .click()
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminImageThumbnail"] span[class*="MuiCircularProgress"]'
      )
    ).toBeHidden({ timeout: fifteenSecondsTimeout })
  }

  async setJourneyName(journey: string) {
    journeyName =
      (journey === 'firstJourneyName'
        ? testData.journey.firstJourneyName
        : testData.journey.secondJourneyName) + randomNumber
  }

  async enterJourneysTypography(): Promise<void> {
    await this.page
      .frameLocator('div[data-testid="EditorCanvas"] iframe')
      .locator(
        'div[data-testid="CardWrapper"] h3[data-testid="JourneysTypography"]'
      )
      .click({ timeout: fifteenSecondsTimeout, delay: 1000 })
    for (let clickRetry = 0; clickRetry < 5; clickRetry++) {
      if (
        await this.page
          .frameLocator('div[data-testid="EditorCanvas"] iframe')
          .locator('h3[data-testid="JourneysTypography"] textarea')
          .first()
          .isVisible()
      ) {
        break
      } else {
        await this.page
          .frameLocator('div[data-testid="EditorCanvas"] iframe')
          .locator(
            'div[data-testid="CardWrapper"] h3[data-testid="JourneysTypography"]'
          )
          .click({ timeout: fifteenSecondsTimeout, delay: 1000 })
      }
    }
    await this.page
      .frameLocator('div[data-testid="EditorCanvas"] iframe')
      .locator('h3[data-testid="JourneysTypography"] textarea')
      .first()
      .clear()
    await this.page
      .frameLocator('div[data-testid="EditorCanvas"] iframe')
      .locator('h3[data-testid="JourneysTypography"] textarea')
      .first()
      .fill(journeyName)
  }

  async clickDoneBtn(): Promise<void> {
    await this.page.locator('button[data-testid="Fab"]').click()
  }

  async clickThreeDotBtnOfCustomJourney(): Promise<void> {
    await this.page.locator('button#edit-journey-actions').click()
  }

  async clickTitleInThreeDotOptions() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItem"]', { hasText: 'Title' })
      .click()
  }

  async enterTitle() {
    await this.page.locator('input#title').click({ delay: 2000 })
    await this.page.locator('input#title').clear()
    await this.page.locator('input#title').fill(journeyName)
  }

  async clickSaveBtn() {
    await this.page
      .locator('div[role="dialog"] button', { hasText: 'Save' })
      .click()
  }

  async backIcon() {
    await this.page.locator('svg[data-testid="ChevronLeftIcon"]').click()
  }

  async verifyCreatedCustomJourneyInActiveList() {
    await expect(
      this.page.locator('span[data-testid="new-journey-badge"] div').first()
    ).toBeVisible({ timeout: thirtySecondsTimeout })
    await expect(
      this.page.locator('span[data-testid="new-journey-badge"] div', {
        hasText: journeyName
      })
    ).toBeVisible()
  }

  async clickOnTheCreatedCustomJourney() {
    await this.page
      .locator('span[data-testid="new-journey-badge"] div', {
        hasText: journeyName
      })
      .click()
    await expect(this.page.locator('button#delete-block-actions')).toBeVisible({
      timeout: fifteenSecondsTimeout
    })
  }

  async clickTheCreateTempleteOption() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItemCreateTemplate"] span', {
        hasText: 'Create Template'
      })
      .click({ delay: 1000 })
    await expect(
      this.page.locator('a[href*="publisher"][class*="Mui-selected"]')
    ).toBeVisible()
  }

  async verifyCreatedJourneyInTemplateList() {
    await expect(
      this.page.locator(
        'div[aria-label="template-card"] div[class*="MuiCardContent"] h6',
        { hasText: journeyName }
      )
    ).toBeVisible()
  }

  async clickThreeDotOfCreatedNewTemple() {
    await this.page
      .locator(
        "//h6[text()='" +
          journeyName +
          "']//ancestor::a/following-sibling::div//button[@id='journey-actions']"
      )
      .click()
  }

  async clickArchiveOption() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItemArchive"]')
      .click()
    await this.verifyToastMessage()
  }

  async clickArchivedTab() {
    await this.page.locator('button[id*="archived-status-panel-tab"]').click()
    await expect(
      this.page.locator(
        'button[id*="archived-status-panel-tab"][aria-selected="true"]'
      )
    ).toBeVisible()
  }

  async verifyCreatedNewTemplateMovedToArchiveOrNot() {
    await expect(
      this.page.locator(
        'div[id*="archived-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6',
        { hasText: journeyName }
      )
    ).toBeVisible()
  }

  async clickTrashOption() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItem"]', { hasText: 'Trash' })
      .click()
  }

  async clickDeleteBtn() {
    await this.page
      .locator('div[role="dialog"] button', { hasText: 'Delete' })
      .click()
    await this.verifyToastMessage()
  }

  async verifyToastMessage() {
    await expect(this.page.locator('#notistack-snackbar')).toBeVisible({
      timeout: thirtySecondsTimeout
    })
    await expect(this.page.locator('#notistack-snackbar')).toBeHidden({
      timeout: thirtySecondsTimeout
    })
  }

  async clickTrashTab() {
    await this.page.locator('button[id*="trashed-status-panel-tab"]').click()
    await expect(
      this.page.locator(
        'button[id*="trashed-status-panel-tab"][aria-selected="true"]'
      )
    ).toBeVisible()
  }

  async verifyCreatedNewTemplateMovedToTrashTabOrNot() {
    await expect(
      this.page.locator(
        'div[id*="trashed-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6',
        { hasText: journeyName }
      )
    ).toBeVisible()
  }

  async clickThreeDotOfCreatedNewJourney() {
    await this.page
      .locator(
        "//div[text()='" +
          journeyName +
          "']//ancestor::a/following-sibling::div//button[@id='journey-actions']"
      )
      .click()
  }

  async clickTheRestore() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItemRestore"] span', {
        hasText: 'Restore'
      })
      .click()
  }

  async verifyCreatedNewJourneyMovedToTrashTabOrNot() {
    await expect(
      this.page.locator(
        'div[id*="trashed-status-panel-tabpanel"] span[data-testid="new-journey-badge"] div',
        { hasText: journeyName }
      )
    ).toBeVisible()
  }

  async clickActiveTab() {
    await this.page.locator('button[id*="active-status-panel-tab"]').click()
    await expect(
      this.page.locator(
        'button[id*="active-status-panel-tab"][aria-selected="true"]'
      )
    ).toBeVisible()
  }

  async clickRestoreBtn() {
    await this.page
      .locator('div[role="dialog"] button', { hasText: 'Restore' })
      .click()
    await this.verifyToastMessage()
  }

  async verifyCreatedNewJourneyMovedToActiveTabOrNot() {
    await expect(
      this.page.locator(
        'div[id*="active-status-panel-tabpanel"] span[data-testid="new-journey-badge"] div',
        { hasText: journeyName }
      )
    ).toBeVisible()
  }

  async clickDeleteForeverOption() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItemDelete"] span', {
        hasText: 'Delete Forever'
      })
      .click()
  }

  async verifyCreatedNewTemplateRemovedFromTrashTabOrNot() {
    await expect(
      this.page.locator(
        'div[id*="trashed-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6',
        { hasText: journeyName }
      )
    ).toBeHidden()
  }
}
