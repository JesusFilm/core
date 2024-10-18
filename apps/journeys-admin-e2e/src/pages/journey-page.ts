/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import dayjs from 'dayjs'
import { Page } from 'playwright-core'

import testData from '../utils/testData.json'

let journeyName = ''
let randomNumber = ''
const thirtySecondsTimeout = 30000
const sixtySecondsTimeout = 60000

export class JourneyPage {
  existingJourneyName = ''
  journeyList: string[]
  readonly page: Page
  context
  journeyCardFrame =
    'div[data-testid="EditorCanvas"] div[data-testid="CanvasContainer"] iframe'

  constructor(page: Page) {
    this.page = page
    randomNumber =
      dayjs().format('DDMMYY-hhmmss') +
      Math.floor(Math.random() * (100 - 999 + 1) + 999)
    journeyName = testData.journey.firstJourneyName + randomNumber
  }

  async createAndVerifyCustomJourney() {
    await this.enterJourneysTypography()
    await this.clickDoneBtn()
    await this.clickThreeDotBtnOfCustomJourney()
    await this.clickJourneyDetailsInThreeDotOptions()
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
    await this.navigateToPublisherPage()
    await this.verifyCreatedJourneyInTemplateList()
  }

  async verifyCreatedNewTemplateMovedToArchivedTab() {
    await this.clickThreeDotOfCreatedNewTemple()
    await this.clickArchiveOption()
    await this.verifyToastMessage()
    await this.clickArchivedTab()
    await this.verifyCreatedNewTemplateMovedToArchiveOrNot()
  }

  async verifyCreatedNewTemplateMovedToTrashTab() {
    await this.clickThreeDotOfCreatedNewTemple()
    await this.clickTrashOption()
    await this.clickDeleteBtn()
    await this.verifyToastMessage()
    await this.clickTrashTab()
    await this.verifyCreatedNewTemplateMovedToTrashTabOrNot()
  }

  async verifyCreatedNewTemplateDetetedForever() {
    await this.clickThreeDotOfCreatedNewTemple()
    await this.clickDeleteForeverOption()
    await this.clickDeleteBtn()
    await this.verifyToastMessage()
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
    ).toBeVisible({ timeout: thirtySecondsTimeout })
    await expect(
      this.page.locator('div[data-testid="JourneysAdminContainedIconButton"]')
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async verifyCreatedJourneyMovedToTrash() {
    await this.clickThreeDotOfCreatedNewJourney()
    await this.clickTrashOption()
    await this.clickDeleteBtn()
    await this.verifySnackbarToastMessage('Journey trashed')
    await this.clickTrashTab()
    await this.verifyCreatedNewJourneyMovedToTrashTabOrNot()
  }

  async verifyCreatedNewJourneyRestored() {
    await this.clickThreeDotOfCreatedNewJourney()
    await this.clickTheRestore()
    await this.clickRestoreBtn()
    await this.verifySnackbarToastMessage('Journey Restored')
    await this.clickActiveTab()
    await this.verifyCreatedNewJourneyMovedToActiveTabOrNot()
  }

  async verifyExistingJourneyMovedActiveToArchivedTab() {
    await this.clickThreeDotOfExistingJourney()
    await this.setExistingJourneyNameToJourneyName()
    await this.clickArchiveOption()
    await this.verifySnackbarToastMessage('Journey Archived')
    await this.clickArchivedTab()
    await this.verifyJourneyMovedToArchiveOrNot()
  }

  async verifyJourneyDeletedForeverFromTrashTab() {
    await this.clickThreeDotOfCreatedNewJourney()
    await this.clickDeleteForeverOption()
    await this.clickDeleteBtn()
    await this.verifySnackbarToastMessage('Journey Deleted')
    await this.verifyJourneyDeletedForeverInTrashTab()
  }

  async verifyJourneyMovedFromArchivedToActiveTab() {
    await this.clickThreeDotOfCreatedNewJourney()
    await this.clickUnarchiveOption()
    await this.verifySnackbarToastMessage('Journey Unarchived')
    await this.clickActiveTab()
    await this.verifyCreatedNewJourneyMovedToActiveTabOrNot()
  }

  async verifyAllJourneysMovedActiveToArchivedTab() {
    await this.getJourneyListOfActiveTab()
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Archive All')
    await this.clickDialogBoxBtn('Archive')
    await this.verifySnackbarToastMessage('Journeys Archived')
    await this.verifyActiveTabShowsEmptyMessage()
    await this.clickArchivedTab()
    await this.verifyAllJourneyMovedToArchivedTab()
  }

  async verifyAllJourneysMovedToTrash() {
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Trash All')
    await this.clickDialogBoxBtn('Trash')
    await this.verifySnackbarToastMessage('Journeys Trashed')
    await this.clickTrashTab()
    await this.verifyAllJourneyMovedToTrashTab()
  }

  async verifyAllJourneysRestored() {
    await this.getJourneyListOfTrashTab()
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Restore All')
    await this.clickDialogBoxBtn('Restore')
    await this.verifySnackbarToastMessage('Journeys Restored')
    await this.clickActiveTab()
    await this.verifyAllJourneyMovedToActiveTab()
  }

  async verifyAllJourneysDeletedForeverFromTrashTab() {
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Delete All Forever')
    await this.clickDialogBoxBtn('Delete Forever')
    await this.verifySnackbarToastMessage('Journeys Deleted')
    await this.verifyAlljourneysAreDeletedFromTrashTab()
  }

  async verifyAllJourneysMovedFromArchivedToActiveTab() {
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Unarchive All')
    await this.clickDialogBoxBtn('Unarchive')
    await this.verifyToastMessage()
    await this.verifyEmptyMessageInArchivedTab()
    await this.clickActiveTab()
    await this.verifyAllJourneyMovedToActiveTab()
  }

  async verifyJourneyCreatedViaTemplate() {
    await this.enterJourneysTypographyForTemplate()
    await this.clickDoneBtn()
    await this.clickThreeDotBtnOfCustomJourney()
    await this.clickJourneyDetailsInThreeDotOptions()
    await this.enterTitle()
    await this.clickSaveBtn()
    await this.backIcon()
    await this.verifyCreatedCustomJourneyInActiveList()
  }

  // Create a custom journey
  async createCustomJourney(): Promise<void> {
    await this.page
      .getByRole('button', { name: 'Create Custom Journey' })
      .click()
    await this.page
      .getByTestId('CardItem-7766fd12-8534-42b6-980d-44a9e0031234')
      .locator('div')
      .nth(2)
      .click()
    await this.page.getByTestId('Fab').click()
    await this.page.getByRole('button', { name: 'Image' }).click()
    await this.page
      .getByRole('button', { name: 'white dome building during daytime' })
      .click()
    await this.page.getByRole('link', { name: 'Preview' }).click()
  }

  async clickCreateCustomJourney(): Promise<void> {
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminContainedIconButton"] button'
      )
    ).toBeVisible({ timeout: sixtySecondsTimeout })
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminImageThumbnail"] span[class*="MuiCircularProgress"]'
      )
    ).toBeHidden({ timeout: sixtySecondsTimeout })
    await this.page
      .locator('div[data-testid="JourneysAdminContainedIconButton"] button')
      .click()
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminImageThumbnail"] span[class*="MuiCircularProgress"]'
      )
    ).toBeHidden({ timeout: sixtySecondsTimeout })
  }

  async setJourneyName(journey: string) {
    journeyName =
      (journey === 'firstJourneyName'
        ? testData.journey.firstJourneyName
        : testData.journey.secondJourneyName) + randomNumber
  }

  async enterJourneysTypography(): Promise<void> {
    await this.page
      .frameLocator(this.journeyCardFrame)
      .first()
      .locator(
        'div[data-testid="CardWrapper"] div[data-testid*="SelectableWrapper"] h3[data-testid="JourneysTypography"]'
      )
      .first()
      .click({ timeout: sixtySecondsTimeout, delay: 1000 })
    for (let clickRetry = 0; clickRetry < 5; clickRetry++) {
      if (
        await this.page
          .frameLocator(this.journeyCardFrame)
          .first()
          .locator('h3[data-testid="JourneysTypography"] textarea')
          .first()
          .isVisible()
      ) {
        break
      } else {
        await this.page
          .frameLocator(this.journeyCardFrame)
          .first()
          .locator(
            'div[data-testid="CardWrapper"] div[data-testid*="SelectableWrapper"] h3[data-testid="JourneysTypography"]'
          )
          .first()
          .click({ timeout: sixtySecondsTimeout, delay: 1000 })
      }
    }
    await this.page
      .frameLocator(this.journeyCardFrame)
      .first()
      .locator('h3[data-testid="JourneysTypography"] textarea')
      .first()
      .clear()
    await this.page
      .frameLocator(this.journeyCardFrame)
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

  async clickJourneyDetailsInThreeDotOptions() {
    await this.page
      .locator(
        'ul[aria-labelledby="edit-journey-actions"] li[role="menuitem"]',
        { hasText: 'Edit Details' }
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
    await expect(
      this.page.locator('div[data-testid="StrategyItem"] button')
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async clickTheCreateTempleteOption() {
    await this.page
      .locator(
        'ul[aria-labelledby="edit-journey-actions"] li[role="menuitem"]',
        { hasText: 'Create Template' }
      )
      .click({ delay: 1000 })
    await this.page.waitForURL('**/publisher/**')
  }

  async verifyCreatedJourneyInTemplateList() {
    await expect(
      this.page
        .locator(
          'div[aria-label="template-card"] div[class*="MuiCardContent"] h6',
          { hasText: journeyName }
        )
        .first()
    ).toBeVisible({ timeout: thirtySecondsTimeout })
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
    journeyName = this.existingJourneyName
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
    ).toBeVisible({ timeout: thirtySecondsTimeout })
    const archiveTabJournetList = await this.page
      .locator(
        'div[aria-labelledby*="archived-status-panel-tab"] span[data-testid="new-journey-badge"] div'
      )
      .allInnerTexts()
    for (let journey = 0; journey < this.journeyList.length; journey++) {
      if (archiveTabJournetList.includes(this.journeyList[journey])) {
        matchCount = matchCount + 1
      }
    }
    expect(matchCount === this.journeyList.length).toBeTruthy()
  }

  async verifyActiveTabShowsEmptyMessage() {
    await expect(
      this.page.locator('div[aria-labelledby*="active-status-panel-tab"] h6', {
        hasText: 'No journeys to display.'
      })
    ).toBeVisible()
  }

  async getJourneyListOfArchivedTab() {
    await expect(
      this.page
        .locator(
          'div[aria-labelledby*="archived-status-panel-tab"] span[data-testid="new-journey-badge"] div'
        )
        .first()
    ).toBeVisible()
    this.journeyList = await this.page
      .locator(
        'div[aria-labelledby*="archived-status-panel-tab"] span[data-testid="new-journey-badge"] div'
      )
      .allInnerTexts()
  }

  async verifyAllJourneyMovedToTrashTab() {
    let matchCount = 0
    await expect(
      this.page
        .locator(
          'div[aria-labelledby*="trashed-status-panel-tab"] span[data-testid="new-journey-badge"] div'
        )
        .first()
    ).toBeVisible({ timeout: thirtySecondsTimeout })
    const TrashTabJournetList = await this.page
      .locator(
        'div[aria-labelledby*="trashed-status-panel-tab"] span[data-testid="new-journey-badge"] div'
      )
      .allInnerTexts()
    for (let journey = 0; journey < this.journeyList.length; journey++) {
      if (TrashTabJournetList.includes(this.journeyList[journey])) {
        matchCount = matchCount + 1
      }
    }
    expect(matchCount === this.journeyList.length).toBeTruthy()
  }

  async getJourneyListOfTrashTab() {
    await expect(
      this.page
        .locator(
          'div[aria-labelledby*="trashed-status-panel-tab"] span[data-testid="new-journey-badge"] div'
        )
        .first()
    ).toBeVisible()
    this.journeyList = await this.page
      .locator(
        'div[aria-labelledby*="trashed-status-panel-tab"] span[data-testid="new-journey-badge"] div'
      )
      .allInnerTexts()
  }

  async verifyAllJourneyMovedToActiveTab() {
    let matchCount = 0
    await expect(
      this.page
        .locator(
          'div[id*="active-status-panel-tabpanel"] span[data-testid="new-journey-badge"] div'
        )
        .first()
    ).toBeVisible({ timeout: thirtySecondsTimeout })
    const activeTabJournetList = await this.page
      .locator(
        'div[id*="active-status-panel-tabpanel"] span[data-testid="new-journey-badge"] div'
      )
      .allInnerTexts()
    for (let journey = 0; journey < this.journeyList.length; journey++) {
      if (activeTabJournetList.includes(this.journeyList[journey])) {
        matchCount = matchCount + 1
      }
    }
    expect(matchCount === this.journeyList.length).toBeTruthy()
  }

  async verifyAlljourneysAreDeletedFromTrashTab() {
    await expect(
      this.page
        .locator(
          'div[aria-labelledby*="trashed-status-panel-tab"] span[data-testid="new-journey-badge"] div'
        )
        .first()
    ).toHaveCount(0)
    await expect(
      this.page.locator('div[aria-labelledby*="trashed-status-panel-tab"] h6', {
        hasText: 'Your trashed journeys will appear here.'
      })
    ).toBeVisible()
  }

  async verifySnackbarToastMessage(message: string) {
    await expect(
      this.page.locator('#notistack-snackbar', { hasText: message })
    ).toBeVisible({ timeout: sixtySecondsTimeout })
    await expect(this.page.locator('#notistack-snackbar')).toBeHidden({
      timeout: thirtySecondsTimeout
    })
  }

  async verifyEmptyMessageInArchivedTab() {
    await expect(
      this.page.locator(
        'div[aria-labelledby*="archived-status-panel-tab"] h6',
        { hasText: 'No archived journeys.' }
      )
    ).toBeVisible()
  }

  async clickSortByIcon() {
    await this.page
      .locator('div[aria-label="journey status tabs"] div[role="button"]')
      .click()
  }

  async clickSortOpion(sortOption: string) {
    await this.page
      .locator(
        'div[aria-label="sort-by-options"] span[class*="MuiFormControlLabel"]',
        { hasText: sortOption }
      )
      .click()
  }

  async verifySelectedSortOptionInSortByIcon(selectedSortOption: string) {
    await expect(
      this.page.locator(
        'div[aria-label="journey status tabs"] div[role="button"]',
        { hasText: selectedSortOption }
      )
    ).toBeVisible({ timeout: thirtySecondsTimeout })
  }

  async verifyJouyneysAreSortedByNames() {
    const journeyList = await this.page
      .locator(
        'div[id*="active-status-panel-tabpanel"] div[aria-label="journey-card"]',
        {
          has: this.page.locator(
            'span[class*="MuiBadge-invisible"] svg[aria-label="New"]'
          )
        }
      )
      .locator('span[data-testid="new-journey-badge"] div')
      .allInnerTexts()
    const journeyExpectedList = await this.page
      .locator(
        'div[id*="active-status-panel-tabpanel"] div[aria-label="journey-card"]',
        {
          has: this.page.locator(
            'span[class*="MuiBadge-invisible"] svg[aria-label="New"]'
          )
        }
      )
      .locator('span[data-testid="new-journey-badge"] div')
      .allInnerTexts()
    await this.sortTheListToAscendingOrder(journeyList, journeyExpectedList)
  }

  async sortTheListToAscendingOrder(
    list: string[],
    expectedSortedList: string[]
  ) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    list.map((str) => str.toLowerCase()).sort(Intl.Collator().compare)
    expect(list.join().trim() === expectedSortedList.join().trim()).toBeTruthy()
  }

  async verifyNewlyJouyneysAreSortedByNames() {
    const journeyListCount = await this.page
      .locator(
        'div[id*="active-status-panel-tabpanel"] div[aria-label="journey-card"]',
        {
          hasNot: this.page.locator(
            'span[class*="MuiBadge-invisible"] svg[aria-label="New"]'
          )
        }
      )
      .locator('span[data-testid="new-journey-badge"] div')
      .count()
    if (journeyListCount !== 0) {
      const journeyList = await this.page
        .locator(
          'div[id*="active-status-panel-tabpanel"] div[aria-label="journey-card"]',
          {
            hasNot: this.page.locator(
              'span[class*="MuiBadge-invisible"] svg[aria-label="New"]'
            )
          }
        )
        .locator('span[data-testid="new-journey-badge"] div')
        .allInnerTexts()
      const journeyExpectedList = await this.page
        .locator(
          'div[id*="active-status-panel-tabpanel"] div[aria-label="journey-card"]',
          {
            hasNot: this.page.locator(
              'span[class*="MuiBadge-invisible"] svg[aria-label="New"]'
            )
          }
        )
        .locator('span[data-testid="new-journey-badge"] div')
        .allInnerTexts()
      await this.sortTheListToAscendingOrder(journeyList, journeyExpectedList)
    } else {
      console.log('There are no new journeys exist to name sort')
    }
  }

  async verifyJourneyAreSortedByDates() {
    const journeysDescriptionList = await this.page
      .locator(
        'div[id*="active-status-panel-tabpanel"] div[aria-label="journey-card"]',
        {
          has: this.page.locator(
            'span[class*="MuiBadge-invisible"] svg[aria-label="New"]'
          )
        }
      )
      .locator('span[data-testid="new-journey-badge"] + span')
      .allInnerTexts()
    const journeySiteSortedDate: string[] = []
    const journeyExpectdSortedList: string[] = []
    for (let journey = 0; journey < journeysDescriptionList.length; journey++) {
      journeySiteSortedDate.push(
        journeysDescriptionList[journey].split('-')[0].trim()
      )
      journeyExpectdSortedList.push(
        journeysDescriptionList[journey].split('-')[0].trim()
      )
    }
    await this.sortDateToDessendingOrder(
      journeySiteSortedDate,
      journeyExpectdSortedList
    )
  }

  async sortDateToDessendingOrder(
    expectedSortedList: string[],
    list: string[]
  ) {
    list.sort((a: string, b: string) => {
      const dateA = new Date(a)
      const dateB = new Date(b)
      return dateB.getTime() - dateA.getTime()
    })
    expect(list.join().trim() === expectedSortedList.join().trim()).toBeTruthy()
  }

  async verifyNewlyJourneyAreSortedByDates() {
    const journeysDescriptionCount = await this.page
      .locator(
        'div[id*="active-status-panel-tabpanel"] div[aria-label="journey-card"]',
        {
          hasNot: this.page.locator(
            'span[class*="MuiBadge-invisible"] svg[aria-label="New"]'
          )
        }
      )
      .locator('span[data-testid="new-journey-badge"] + span')
      .count()
    if (journeysDescriptionCount !== 0) {
      const journeysDescriptionList = await this.page
        .locator(
          'div[id*="active-status-panel-tabpanel"] div[aria-label="journey-card"]',
          {
            hasNot: this.page.locator(
              'span[class*="MuiBadge-invisible"] svg[aria-label="New"]'
            )
          }
        )
        .locator('span[data-testid="new-journey-badge"] + span')
        .allInnerTexts()
      const journeySiteSortedDate: string[] = []
      const journeyExpectdSortedList: string[] = []
      for (
        let journey = 0;
        journey < journeysDescriptionList.length;
        journey++
      ) {
        journeySiteSortedDate.push(
          journeysDescriptionList[journey].split('-')[0].trim()
        )
        journeyExpectdSortedList.push(
          journeysDescriptionList[journey].split('-')[0].trim()
        )
      }
      await this.sortDateToDessendingOrder(
        journeySiteSortedDate,
        journeyExpectdSortedList
      )
    } else {
      console.log('There are no new journeys exist to sort')
    }
  }

  async verifySeeLinkHrefAttributeBesideUseTemplate() {
    await expect(
      this.page.locator('h6:has-text("Use Template") + a', {
        hasText: 'See all'
      })
    ).toHaveAttribute('href', '/templates')
  }

  async verifySeeAllTemplateBelowUseTemplate() {
    await expect(
      this.page.locator('div[data-testid="SidePanelContainer"] a', {
        hasText: 'See all templates'
      })
    ).toHaveAttribute('href', '/templates')
  }

  async clickPreviewBtnInCustomJourneyPage() {
    await this.page
      .getByTestId('PreviewItem')
      .getByRole('link', { name: 'Preview' })
      .click()
  }

  async verifyPreviewFromCustomJourneyPage() {
    const [newPage] = await Promise.all([
      this.context.waitForEvent('page'),
      this.clickPreviewBtnInCustomJourneyPage()
    ])
    await newPage.waitForLoadState()
    // await expect(await newPage.locator('h3[data-testid="JourneysTypography"]')).toHaveText(this.existingJourneyName)
    const tabName: string = await newPage.title()
    await expect(tabName.includes(journeyName)).toBeTruthy()
    const slidesCount = await newPage
      .locator(
        'div[data-testid="pagination-bullets"] svg[data-testid*="bullet"]'
      )
      .count()
    await expect(
      newPage
        .locator(
          'div[data-testid="pagination-bullets"] svg[data-testid*="bullet"]'
        )
        .first()
    ).toHaveAttribute('data-testid', 'bullet-active')
    for (let slide = 1; slide < slidesCount; slide++) {
      await newPage
        .locator('button[data-testid="ConductorNavigationButtonNext"]')
        // eslint-disable-next-line playwright/no-force-option
        .hover({ force: true })
      await newPage
        .locator('button[data-testid="ConductorNavigationButtonNext"]')
        .click()
      await expect(
        newPage
          .locator(
            'div[data-testid="pagination-bullets"] svg[data-testid*="bullet"]'
          )
          .nth(slide)
      ).toHaveAttribute('data-testid', 'bullet-active')
    }
    await newPage.close()
  }

  async setBrowserContext(context) {
    this.context = context
  }

  async selectExistingJourney() {
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
      .click()
  }

  async navigateToPublisherPage() {
    await this.page
      .locator('a[data-testid="NavigationListItemPublisher"]')
      .click()
    await expect(
      this.page.locator('div[data-testid="JourneysAdminTemplateList"]')
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async clickAnalyticsIconInCustomJourneyPage() {
    await this.page.locator('div[data-testid="AnalyticsItem"] a').click()
  }

  async verifyAnalyticsPageNavigation() {
    const [newPage] = await Promise.all([
      this.context.waitForEvent('page'),
      this.clickAnalyticsIconInCustomJourneyPage()
    ])
    await newPage.waitForLoadState()
    await expect(
      newPage.locator('div[data-testid="JourneysAdminReportsNavigation"]')
    ).toBeVisible()
    await newPage.close()
  }

  async clickOnJourneyCard() {
    await this.page
      .frameLocator(this.journeyCardFrame)
      .first()
      .locator('div[data-testid="CardOverlayImageContainer"]')
      .first()
      .click()
  }

  async enterJourneysTypographyForTemplate(): Promise<void> {
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
      .fill(journeyName)
  }
}
