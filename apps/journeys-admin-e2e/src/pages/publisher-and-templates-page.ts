/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import type { Page } from 'playwright-core'

import testData from '../utils/testData.json'

export class Publisher {
  readonly page: Page
  constructor(page: Page) {
    this.page = page
  }

  templateName: string
  templateList: string[]
  topicFilter: string
  feltNeedsFilter: string
  holidaysFilter: string
  audienceFilter: string
  genreFilter: string
  collectionsFilter: string
  uploadedImgSrc
  dropdownListBoxPath = 'div[data-popper-placement="bottom"] ul[role="listbox"]'
  async verifyTemplateMovedToArchivedTab() {
    await this.getExistingTemplateName()
    await this.clickThreeDotOfTemple()
    await this.clickArchiveOption()
    await this.verifyToastMessage('Journey Archived')
    await this.clickArchivedTab()
    await this.verifyCreatedNewTemplateMovedToArchiveOrNot()
  }

  async verifyTemplateMovedToTrashTab() {
    await this.clickThreeDotOfTemple()
    await this.clickTrashOption()
    await this.clickDeleteBtn()
    await this.verifyToastMessage('Journey trashed')
    await this.clickTrashTab()
    await this.verifyCreatedNewTemplateMovedToTrashTabOrNot()
  }

  async verifyTemplateDetetedForever() {
    await this.clickThreeDotOfTemple()
    await this.clickDeleteForeverOption()
    await this.clickDeleteBtn()
    await this.verifyToastMessage('Journey Deleted')
    await this.verifyCreatedNewTemplateRemovedFromTrashTabOrNot()
  }

  async verifyTemplateRestoredToActiveTab() {
    await this.clickThreeDotOfTemple()
    await this.clickTheRestore()
    await this.clickRestoreBtn()
    await this.verifyToastMessage('Journey Restored')
    await this.clickActiveTab()
    await this.verifyTemplateMovedToActivePage()
  }

  async verifyTemplateMovedUnarchivedToActiveTab() {
    await this.clickThreeDotOfTemple()
    await this.clickUnarchiveOption()
    await this.verifyToastMessage('Journey Unarchived')
    await this.clickActiveTab()
    await this.verifyTemplateMovedToActivePage()
  }

  async verifyAllTemplateMovedActiveToArchivedTab() {
    await this.getTemplateListOfActiveTab()
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Archive All')
    await this.clickDialogBoxBtn('Archive')
    await this.verifyToastMessage('Journeys Archived')
    await this.verifyActiveTabShowsEmptyMessage()
    await this.clickArchivedTab()
    await this.verifyAllTemplateMovedToArchivedTab()
  }

  async verifyAllTemplateMovedUnarchieToActiveTab() {
    await this.getTemplateListOfArchivedTab()
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Unarchive All')
    await this.clickDialogBoxBtn('Unarchive')
    await this.verifyToastMessage('Journeys Restored')
    await this.verifyEmptyMessageInArchivedTab()
    await this.clickActiveTab()
    await this.verifyAllTemplateMovedToActiveTab()
  }

  async verifyAllJourneysMovedToTrash() {
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Trash All')
    await this.clickDialogBoxBtn('Trash')
    await this.verifyToastMessage('Journeys Trashed')
    await this.clickTrashTab()
    await this.verifyAllTemplateMovedToTrashTab()
  }

  async verifyAllTemplateRestoredToActiveTab() {
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Restore All')
    await this.clickDialogBoxBtn('Restore')
    await this.verifyToastMessage('Journeys Restored')
    await this.clickActiveTab()
    await this.verifyAllTemplateMovedToActiveTab()
  }

  async verifyAlltemplateDeletedForeverFromTrashTab() {
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Delete All Forever')
    await this.clickDialogBoxBtn('Delete Forever')
    await this.verifyToastMessage('Journeys Deleted')
    await this.verifyAllTemplateAreDeletedFromTrashTab()
  }

  async setFilterBelowCategoriesTabInTemplateSettingPopup(filter: string) {
    await this.clickOpenDropDownIconToFilter(filter)
    await this.setFilterBelowCategoryTab(filter)
    await this.addFilterBelowCategoryTab(filter)
    await this.clickCloseDropDownIconToFilter(filter)
  }
  async setTemplateCategoriesInTemplateSettingPopup(
    filter: string,
    filterOption: string[]
  ) {
    await this.clickOpenDropDownIconToFilter(filter)
    for (const option of filterOption) {
      await this.selectFilterOptionFromList(option)
    }
    await this.clickCloseDropDownIconToFilter(filter)
  }

  async selectFilterOptionFromList(filterOption: string) {
    await this.page
      .locator('div[role="presentation"] ul[role="listbox"] li', {
        hasText: filterOption
      })
      .click()
  }

  async getExistingTemplateName() {
    await expect(
      this.page.locator('div[aria-label="template-card"]').first()
    ).toBeVisible()
    const templateCount = await this.page
      .locator('div[aria-label="template-card"]')
      .count()
    for (let template = 0; template < templateCount; template++) {
      const templateName = await this.page
        .locator(
          'div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
        )
        .nth(template)
        .innerText()
      if (
        (await this.page
          .locator('div[aria-label="template-card"]', { hasText: templateName })
          .count()) === 1
      ) {
        this.templateName = templateName
        break
      }
    }
  }

  async clickThreeDotOfTemple() {
    await this.page
      .locator(
        `//h6[text()='${this.templateName}']//ancestor::a/following-sibling::div//button[@id='journey-actions']`
      )
      .first()
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
        { hasText: this.templateName }
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

  async verifyToastMessage(message: string) {
    await expect(
      this.page.locator('#notistack-snackbar', { hasText: message })
    ).toBeVisible({ timeout: 300000 })
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
        { hasText: this.templateName }
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
        { hasText: this.templateName }
      )
    ).toBeHidden()
  }

  async navigateToPublisherPage() {
    await this.page
      .locator('a[data-testid="NavigationListItemPublisher"]')
      .click()
    await expect(
      this.page.locator('div[data-testid="JourneysAdminTemplateList"]')
    ).toBeVisible({ timeout: 60000 })
  }

  async clickThreeDotOfExistingTemplate() {
    await this.page
      .locator('div[aria-label="template-card"]', {
        hasText: this.templateName
      })
      .locator('#journey-actions')
      .click()
  }

  async clickTheRestore() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItemRestore"] span', {
        hasText: 'Restore'
      })
      .click()
  }

  async clickRestoreBtn() {
    await this.page
      .locator('div[role="dialog"] button', { hasText: 'Restore' })
      .click()
  }

  async clickActiveTab() {
    await this.page.locator('button[id*="active-status-panel-tab"]').click()
    await expect(
      this.page.locator(
        'button[id*="active-status-panel-tab"][aria-selected="true"]'
      )
    ).toBeVisible()
  }

  async verifyTemplateMovedToActivePage() {
    await expect(
      this.page.locator(
        'div[id*="active-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6',
        { hasText: this.templateName }
      )
    ).toBeVisible()
  }

  async clickUnarchiveOption() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItemUnarchive"]')
      .click()
  }

  async getTemplateListOfActiveTab() {
    await expect(
      this.page
        .locator(
          'div[id*="active-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
        )
        .first()
    ).toBeVisible()
    this.templateList = await this.page
      .locator(
        'div[id*="active-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
      )
      .allInnerTexts()
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

  async clickDialogBoxBtn(buttonName) {
    await this.page
      .locator('div[data-testid="dialog-action"] button', {
        hasText: buttonName
      })
      .click()
  }

  async verifyActiveTabShowsEmptyMessage() {
    await expect(
      this.page.locator('div[aria-labelledby*="active-status-panel-tab"] h6', {
        hasText: 'No templates to display.'
      })
    ).toBeVisible()
  }

  async verifyAllTemplateMovedToArchivedTab() {
    let matchCount = 0
    await expect(
      this.page
        .locator(
          'div[id*="archived-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
        )
        .first()
    ).toBeVisible({ timeout: 30000 })
    const archiveTabTemplateList = await this.page
      .locator(
        'div[id*="archived-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
      )
      .allInnerTexts()
    for (let template = 0; template < this.templateList.length; template++) {
      if (archiveTabTemplateList.includes(this.templateList[template])) {
        matchCount = matchCount + 1
      }
    }
    expect(matchCount === this.templateList.length).toBeTruthy()
  }

  async getTemplateListOfArchivedTab() {
    await expect(
      this.page
        .locator(
          'div[id*="archived-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
        )
        .first()
    ).toBeVisible()
    this.templateList = await this.page
      .locator(
        'div[id*="archived-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
      )
      .allInnerTexts()
  }

  async verifyEmptyMessageInArchivedTab() {
    await expect(
      this.page.locator('div[id*="archived-status-panel-tabpanel"] h6', {
        hasText: 'No archived templates.'
      })
    ).toBeVisible()
  }

  async verifyAllTemplateMovedToActiveTab() {
    let matchCount = 0
    await expect(
      this.page
        .locator(
          'div[id*="active-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
        )
        .first()
    ).toBeVisible({ timeout: 30000 })
    const activeTabTemplateList = await this.page
      .locator(
        'div[id*="active-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
      )
      .allInnerTexts()
    for (let template = 0; template < this.templateList.length; template++) {
      if (activeTabTemplateList.includes(this.templateList[template])) {
        matchCount = matchCount + 1
      }
    }
    expect(matchCount === this.templateList.length).toBeTruthy()
  }

  async verifyAllTemplateMovedToTrashTab() {
    let matchCount = 0
    await expect(
      this.page
        .locator(
          'div[id*="trashed-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
        )
        .first()
    ).toBeVisible({ timeout: 30000 })
    const trashTabTemplateList = await this.page
      .locator(
        'div[id*="trashed-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
      )
      .allInnerTexts()
    for (let template = 0; template < this.templateList.length; template++) {
      if (trashTabTemplateList.includes(this.templateList[template])) {
        matchCount = matchCount + 1
      }
    }
    expect(matchCount === this.templateList.length).toBeTruthy()
  }

  async getTemplateListOfTrashTab() {
    await expect(
      this.page
        .locator(
          'div[id*="trashed-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
        )
        .first()
    ).toBeVisible()
    this.templateList = await this.page
      .locator(
        'div[id*="trashed-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
      )
      .allInnerTexts()
  }

  async verifyAllTemplateAreDeletedFromTrashTab() {
    await expect(
      this.page.locator(
        'div[id*="trashed-status-panel-tabpanel"] div[aria-label="template-card"] div[class*="MuiCardContent"] h6'
      )
    ).toHaveCount(0)
    await expect(
      this.page.locator('div[id*="trashed-status-panel-tabpanel"] h6', {
        hasText: 'Your trashed templates will appear here.'
      })
    ).toBeVisible()
  }

  async clickOnTemplateInPublisherPage() {
    await this.page
      .locator('div[aria-label="template-card"]', {
        hasText: this.templateName
      })
      .click()
  }

  async clickThreeDotInEditTempletePage() {
    await this.page.locator('button[aria-label="Edit Journey Actions"]').click()
  }

  async clickTheDotOptionsInEditTemplatePage(option: string) {
    await this.page
      .locator(
        'ul[aria-labelledby="edit-journey-actions"] li[role="menuitem"]',
        { hasText: option }
      )
      .click()
  }

  async verifyTheTitileBelowMetaDataTab() {
    await expect(
      this.page.locator('div[id*="metadata-tabpanel"] input#title')
    ).toHaveAttribute('value', this.templateName)
  }

  async verifyDescriptionBelowMetaDataTab() {
    await expect(
      this.page.locator('div[id*="metadata-tabpanel"] textarea#description')
    ).toHaveText(
      'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.'
    )
  }

  async verifyLanguageOfTemplateBelowMetaDataTab() {
    await expect(
      this.page.locator(
        'div[id*="metadata-tabpanel"] input[placeholder="Search Language"]'
      )
    ).toHaveAttribute('value', 'English', { timeout: 50000 })
  }

  async clickSaveBtn() {
    await this.page
      .locator('div[data-testid="dialog-action"] button', { hasText: 'Save' })
      .click()
  }

  async verifyTemplateSettingSaveToastMessage() {
    await expect(
      this.page.locator('div#notistack-snackbar', {
        hasText: 'Template settings have been saved'
      })
    ).toBeVisible()
    await expect(
      this.page.locator('div#notistack-snackbar', {
        hasText: 'Template settings have been saved'
      })
    ).toHaveCount(0, { timeout: 30000 })
  }

  async setFilterBelowCategoryTab(filter: string) {
    const listOptionPath = this.page
      .locator('div[role="presentation"].MuiPopper-root')
      .getByRole('listbox')
      .getByRole('option')
      .first()
    const selectedFilter = await listOptionPath.innerText()
    await listOptionPath.click()
    switch (filter) {
      case 'Topics': {
        this.topicFilter = selectedFilter
        break
      }
      case 'Felt Needs': {
        this.feltNeedsFilter = selectedFilter
        break
      }
      case 'Holidays': {
        this.holidaysFilter = selectedFilter
        break
      }
      case 'Audience': {
        this.audienceFilter = selectedFilter
        break
      }
      case 'Genre': {
        this.genreFilter = selectedFilter
        break
      }
      case 'Collections': {
        this.collectionsFilter = selectedFilter
        break
      }
    }
  }

  async addFilterBelowCategoryTab(filter: string) {
    if (filter === 'Felt Needs' || filter === 'Collections') {
      let selectedFilter = ' '
      switch (filter) {
        case 'Felt Needs': {
          selectedFilter = 'Depression'
          break
        }
        case 'Collections': {
          selectedFilter = 'NUA'
          break
        }
      }
      await this.page
        .locator('div[role="presentation"] ul[role="listbox"] li', {
          hasText: selectedFilter
        })
        .first()
        .click()
    }
  }

  async clickOpenDropDownIconToFilter(filter: string) {
    await this.page
      .locator('div[id*="categories-tabpanel"] > div > div', {
        hasText: filter
      })
      .locator('button[aria-label="Open"]')
      .click({ timeout: 40000 })
  }

  async clickCloseDropDownIconToFilter(filter: string) {
    await this.page
      .locator('div[id*="categories-tabpanel"] > div > div', {
        hasText: filter
      })
      .locator('button[aria-label="Close"]')
      .click()
    await expect(
      this.page.locator('div[role="presentation"] ul[role="listbox"] li')
    ).toHaveCount(0)
  }

  async clickTabInTemplateSettingPopup(tabName: string) {
    await this.page
      .locator('div[role="dialog"] button[role="tab"]', { hasText: tabName })
      .click()
  }

  /// ///////////
  async clickDropDownOpenIconForFilters(filterOption: string) {
    await this.page
      .locator(
        'div[class*="MuiGrid-item"] > div[class*="MuiAutocomplete-root"]',
        { hasText: filterOption }
      )
      .locator('button[aria-label="Open"]')
      .click()
  }

  async selectCheckBoxesForTopicDropDown(option: string) {
    let selectedFilter = ''
    switch (option) {
      case 'Topics': {
        selectedFilter = this.topicFilter
        break
      }
      case 'Felt Needs': {
        selectedFilter = this.feltNeedsFilter
        break
      }
      case 'Holidays': {
        selectedFilter = this.holidaysFilter
        break
      }
      case 'Audience': {
        selectedFilter = this.audienceFilter
        break
      }
      case 'Genre': {
        selectedFilter = this.genreFilter
        break
      }
      case 'Collections': {
        selectedFilter = this.collectionsFilter
        break
      }
    }
    await this.page
      .locator(`${this.dropdownListBoxPath}  li ul`, { hasText: option })
      .locator('li[role="option"]', { hasText: selectedFilter })
      .first()
      .click()
  }

  async clickDropDownCloseIconForFilters(filterOption: string) {
    await this.page
      .locator(
        'div[class*="MuiGrid-item"] > div[class*="MuiAutocomplete-root"]',
        { hasText: filterOption }
      )
      .locator('button[aria-label="Close"]')
      .click()
  }

  async verifyCreatedTemplateOfSelectedFilterOption(filterOption: string) {
    let selectedFilter = ''
    switch (filterOption) {
      case 'Topics': {
        selectedFilter = this.topicFilter
        break
      }
      case 'Felt Needs': {
        selectedFilter = this.feltNeedsFilter
        break
      }
      case 'Holidays': {
        selectedFilter = this.holidaysFilter
        break
      }
      case 'Audience': {
        selectedFilter = this.audienceFilter
        break
      }
      case 'Genre': {
        selectedFilter = this.genreFilter
        break
      }
      case 'Collections': {
        selectedFilter = this.collectionsFilter
        break
      }
    }
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminTemplateSections"] div[data-testid*="gallery-carousel"]',
        { hasText: selectedFilter }
      )
    ).toBeVisible({ timeout: 40000 })
    expect(
      await this.page
        .locator(
          'div[data-testid="JourneysAdminTemplateSections"] div[data-testid*="gallery-carousel"]',
          { hasText: selectedFilter }
        )
        .locator('div[role="group"]', { hasText: this.templateName })
        .count()
    ).toBeGreaterThanOrEqual(1)
  }

  async filterClearIcon() {
    await this.page.locator('button[aria-label="Clear"]').click()
  }

  async verifyCreatedTemplatInEnteredFilterOption(filter: string) {
    await this.clickDropDownOpenIconForFilters(
      'Topics, holidays, felt needs, collections'
    )
    await this.selectCheckBoxesForTopicDropDown(filter)
    await this.clickDropDownCloseIconForFilters(
      'Topics, holidays, felt needs, collections'
    )
    await this.verifyCreatedTemplateOfSelectedFilterOption(filter)
    await this.filterClearIcon()
  }

  async selectCheckBoxForFilters(filterOption) {
    let selectedFilter = ''
    switch (filterOption) {
      case 'Topics': {
        selectedFilter = this.topicFilter
        break
      }
      case 'Felt Needs': {
        selectedFilter = this.feltNeedsFilter
        break
      }
      case 'Holidays': {
        selectedFilter = this.holidaysFilter
        break
      }
      case 'Audience': {
        selectedFilter = this.audienceFilter
        break
      }
      case 'Genre': {
        selectedFilter = this.genreFilter
        break
      }
      case 'Collections': {
        selectedFilter = this.collectionsFilter
        break
      }
    }
    await this.page
      .locator(`${this.dropdownListBoxPath} li[role="option"] p`, {
        hasText: selectedFilter
      })
      .click()
  }

  async verifyCreatedTemplatInEnteredFilter(filterOption: string) {
    await this.clickDropDownOpenIconForFilters(filterOption)
    await this.selectCheckBoxForFilters(filterOption)
    await this.clickDropDownCloseIconForFilters(filterOption)
    await this.verifyCreatedTemplateOfSelectedFilterOption(filterOption)
    await this.filterClearIcon()
  }

  async enterCreatorDescription() {
    await this.page
      .locator('textarea#creatorDescription')
      .fill(testData.cardLevelAction.descriptionText)
  }

  async clickImageUploadPlusIcon() {
    await this.page
      .locator('div[role="dialog"] div[data-testid="ImageBlockHeader"] button')
      // eslint-disable-next-line
      .click({ force: true })
  }

  async getImgScrUnderAboutTab() {
    if (
      await this.page
        .locator(
          'div[role="dialog"] div[id*="about-tabpanel"] div[data-testid="ImageBlockHeader"] img'
        )
        .isVisible()
    ) {
      this.uploadedImgSrc = await this.page
        .locator(
          'div[role="dialog"] div[id*="about-tabpanel"] div[data-testid="ImageBlockHeader"] img'
        )
        .getAttribute('src')
    } else {
      this.uploadedImgSrc = ''
    }
  }

  async verifyImageUploaded() {
    await expect(
      this.page.locator(
        'div[role="dialog"] div[id*="about-tabpanel"] div[data-testid="ImageBlockHeader"] img'
      )
    ).toBeVisible({ timeout: 60000 })
    await expect(
      this.page.locator(
        'div[role="dialog"] div[id*="about-tabpanel"] div[data-testid="ImageBlockHeader"] img'
      )
    ).not.toHaveAttribute('src', this.uploadedImgSrc, { timeout: 30000 })
  }

  async clickHelpBtn() {
    await expect(
      this.page
        .getByTestId('MainPanelHeader')
        .locator('button[aria-label="Help"]')
    ).toBeEnabled({ timeout: 30000 })
    await this.page
      .getByTestId('MainPanelHeader')
      .locator('button[aria-label="Help"]')
      .click({ delay: 3000 })
  }
}
