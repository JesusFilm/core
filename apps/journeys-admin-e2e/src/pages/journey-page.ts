import { expect } from '@playwright/test'
import { Page } from 'playwright-core'
import dayjs from 'dayjs'
import testData from '../utils/testData.json'
let journeyName = ''
let randomNumber = ''

export class JourneyPage {
  existingJourneyName = ''
  journeyList: string[]
  readonly page: Page

  constructor(page: Page) {
    this.page = page
    randomNumber = dayjs().format('DDMMYY-hhmmss')
    journeyName = testData.journey.firstJourneyName + randomNumber
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
    ).toBeVisible({ timeout: 30000 })
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
  async verifyExistingJourneyMovedActiveToArchivedTab() {
    await this.clickThreeDotOfExistingJourney()
    await this.setExistingJourneyNameToJourneyName()
    await this.clickArchiveOption()
    await this.clickArchivedTab()
    await this.verifyJourneyMovedToArchiveOrNot()
  }
  async verifyJourneyDeletedForeverFromTrashTab() {
    await this.clickThreeDotOfCreatedNewJourney()
    await this.clickDeleteForeverOption()
    await this.clickDeleteBtn()
    await this.verifyJourneyDeletedForeverInTrashTab()
  }
  async verifyJourneyMovedFromArchivedToActiveTab() {
    await this.clickThreeDotOfCreatedNewJourney()
    await this.clickUnarchiveOption()
    await this.clickActiveTab()
    await this.verifyCreatedNewJourneyMovedToActiveTabOrNot()
  }
  async verifyAllJourneyMovedActiveToArchivedTab() {
    await this.getJourneyListOfActiveTab()
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Archive All')
    await this.clickDialogBoxBtn('Archive')
    await this.verifyToastMessage()
    await this.verifyActiveTabShowsEmptyMessage()
    await this.clickArchivedTab()
    await this.verifyAllJourneyMovedToArchivedTab()
  }

  async clickCreateCustomJourney(): Promise<void> {
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminContainedIconButton"] button'
      )
    ).toBeVisible({ timeout: 1500000 })
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminImageThumbnail"] span[class*="MuiCircularProgress"]'
      )
    ).toBeHidden({ timeout: 15000 })
    await this.page
      .locator('div[data-testid="JourneysAdminContainedIconButton"] button')
      .click()
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminImageThumbnail"] span[class*="MuiCircularProgress"]'
      )
    ).toBeHidden({ timeout: 15000 })
  }
  async setJourneyName(journey: string) {
    journeyName =
      (journey == 'firstJourneyName'
        ? testData.journey.firstJourneyName
        : testData.journey.secondJourneyName) + randomNumber
  }

  async enterJourneysTypography(): Promise<void> {
    await this.page
      .frameLocator(
        'div[data-testid="EditorCanvas"] div[data-testid="CanvasContainer"] iframe'
      )
      .first()
      .locator(
        'div[data-testid="CardWrapper"] div[data-testid*="SelectableWrapper"] h3[data-testid="JourneysTypography"]'
      )
      .first()
      .click({ timeout: 15000, delay: 1000 })
    for (var clickRetry = 0; clickRetry < 5; clickRetry++) {
      if (
        await this.page
          .frameLocator(
            'div[data-testid="EditorCanvas"] div[data-testid="CanvasContainer"] iframe'
          )
          .first()
          .locator('h3[data-testid="JourneysTypography"] textarea')
          .first()
          .isVisible()
      ) {
        break
      } else {
        await this.page
          .frameLocator(
            'div[data-testid="EditorCanvas"] div[data-testid="CanvasContainer"] iframe'
          )
          .first()
          .locator(
            'div[data-testid="CardWrapper"] div[data-testid*="SelectableWrapper"] h3[data-testid="JourneysTypography"]'
          )
          .first()
          .click({ timeout: 15000, delay: 1000 })
      }
    }
    await this.page
      .frameLocator(
        'div[data-testid="EditorCanvas"] div[data-testid="CanvasContainer"] iframe'
      )
      .first()
      .locator('h3[data-testid="JourneysTypography"] textarea')
      .first()
      .clear()
    await this.page
      .frameLocator(
        'div[data-testid="EditorCanvas"] div[data-testid="CanvasContainer"] iframe'
      )
      .first()
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
      .locator(
        'ul[aria-labelledby="edit-journey-actions"] li[role="menuitem"]',
        { hasText: 'Title' }
      )
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
    await this.page.locator('a[data-testid="ToolbarBackButton"]').click()
  }

  async verifyCreatedCustomJourneyInActiveList() {
    await expect(
      this.page.locator('span[data-testid="new-journey-badge"] div').first()
    ).toBeVisible({ timeout: 30000 })
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
      timeout: 15000
    })
  }
  async clickTheCreateTempleteOption() {
    await this.page
      .locator(
        'ul[aria-labelledby="edit-journey-actions"] li[role="menuitem"]',
        { hasText: 'Create Template' }
      )
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
      timeout: 300000
    })
    await expect(this.page.locator('#notistack-snackbar')).toBeHidden({
      timeout: 300000
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
  async getJourneyName() {
    return journeyName
  }
  async clickThreeDotOfExistingJourney() {
    this.existingJourneyName = await this.page
      .locator('span[data-testid="new-journey-badge"] div', {
        hasNotText: 'Untitled Journey'
      })
      .first()
      .innerText()
    await this.page
      .locator('div[aria-label="journey-card"]', {
        hasNotText: 'Untitled Journey'
      })
      .first()
      .locator('button#journey-actions')
      .first()
      .click()
  }
  async setExistingJourneyNameToJourneyName() {
    this.existingJourneyName = journeyName
  }
  async verifyJourneyMovedToArchiveOrNot() {
    await expect(
      this.page.locator(
        'div[aria-labelledby*="archived-status-panel-tab"] span[data-testid="new-journey-badge"]',
        { hasText: journeyName }
      )
    ).toBeVisible()
  }
  async verifyJourneyDeletedForeverInTrashTab() {
    await expect(
      this.page.locator(
        'div[id*="trashed-status-panel-tabpanel"] span[data-testid="new-journey-badge"] div',
        { hasText: journeyName }
      )
    ).toHaveCount(0)
  }
  async clickUnarchiveOption() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItemUnarchive"]')
      .click()
    await this.verifyToastMessage()
  }
  async clickThreeDotBesideSortByOption() {
    await this.page
      .locator(
        'div[aria-label="journey status tabs"] button svg[data-testid="MoreIcon"]'
      )
      .click()
  }
  async selectThreeDotOptionsBesideSortByOption(option) {
    await this.page
      .locator('ul[aria-labelledby="edit-journey-actions"] li', {
        hasText: option
      })
      .click()
  }
  async getJourneyListOfActiveTab() {
    await expect(
      this.page
        .locator(
          'div[id*="active-status-panel-tabpanel"] span[data-testid="new-journey-badge"] div'
        )
        .first()
    ).toBeVisible()
    this.journeyList = await this.page
      .locator(
        'div[id*="active-status-panel-tabpanel"] span[data-testid="new-journey-badge"] div'
      )
      .allInnerTexts()
  }
  async clickDialogBoxBtn(buttonName) {
    await this.page
      .locator('div[data-testid="dialog-action"] button', {
        hasText: buttonName
      })
      .click()
  }
  async getCurrentUrl() {
    console.log('current Url is ' + this.page.url())
  }
  async verifyAllJourneyMovedToArchivedTab() {
    let matchCount = 0
    await expect(
      this.page
        .locator(
          'div[aria-labelledby*="archived-status-panel-tab"] span[data-testid="new-journey-badge"] div'
        )
        .first()
    ).toBeVisible({ timeout: 30000 })
    let archiveTabJournetList = await this.page
      .locator(
        'div[aria-labelledby*="archived-status-panel-tab"] span[data-testid="new-journey-badge"] div'
      )
      .allInnerTexts()
    for (let journey = 0; journey < this.journeyList.length; journey++) {
      if (archiveTabJournetList.includes(this.journeyList[journey])) {
        matchCount = matchCount + 1
      }
    }
    console.log('matchCount ' + matchCount)
    console.log('this.journeyList ' + this.journeyList.length)
    expect(matchCount == this.journeyList.length).toBeTruthy()
  }
  async verifyActiveTabShowsEmptyMessage() {
    await expect(
      this.page.locator('div[aria-labelledby*="active-status-panel-tab"] h6', {
        hasText: 'No journeys to display.'
      })
    ).toBeVisible()
  }
}
