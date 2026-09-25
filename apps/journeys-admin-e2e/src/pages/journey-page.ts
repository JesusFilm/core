/* eslint-disable @typescript-eslint/explicit-function-return-type */
import fs from 'fs'
import path from 'path'

import { expect } from '@playwright/test'
import type { Page } from 'playwright-core'

import { generateRandomNumber, getBaseUrl } from '../framework/helpers'
import testData from '../utils/testData.json'

let journeyName = ''
const thirtySecondsTimeout = 30000
const sixtySecondsTimeout = 60000
// eslint-disable-next-line no-undef
const downloadFolderPath = path.join(__dirname, '../utils/download/')

export class JourneyPage {
  existingJourneyName = ''
  journeyList: string[]
  readonly page: Page
  context
  journeyCardFrame =
    'div[data-testid="EditorCanvas"] div[data-testid="CanvasContainer"] iframe'
  downloadedQrFile: string
  journeyNamePath =
    'div[data-testid *="JourneyCard"] div.MuiCardContent-root h6.MuiTypography-root'
  constructor(page: Page) {
    this.page = page
  }

  async setNewJourneyName() {
    journeyName = testData.journey.firstJourneyName + generateRandomNumber(3)
  }
  async verifyJourneyTitleGotUpdated() {
    await expect(
      this.page.locator(
        'button[aria-label="Click to edit"] p.MuiTypography-root',
        { hasText: journeyName }
      )
    ).toBeVisible({ timeout: thirtySecondsTimeout })
  }
  async createAndVerifyCustomJourney() {
    await this.enterJourneysTypography()
    await this.clickDoneBtn()
    await this.clickThreeDotBtnOfCustomJourney()
    await this.clickEditDetailsInThreeDotOptions()
    await this.enterTitle()
    await this.clickSaveBtn()
    await this.verifyJourneyTitleGotUpdated()
    await this.backToHome()
    await this.verifyCreatedCustomJourneyInActiveList()
  }
  async createANewCustomJourney() {
    await this.enterJourneysTypography()
    await this.clickDoneBtn()
    await this.clickThreeDotBtnOfCustomJourney()
    await this.clickEditDetailsInThreeDotOptions()
    await this.enterTitle()
    await this.clickSaveBtn()
    await this.verifyJourneyTitleGotUpdated()
  }
  async createAndVerifyTemplateFromNewJourney() {
    await this.clickThreeDotBtnOfCustomJourney()
    await this.clickCreateTempleteOrTemplateSettingsOption('Create Template')
    await this.backToHome()
    await this.verifyCreatedCustomJourneyInActiveList()
    await this.navigateToPublisherPage()
    await this.verifyCreatedJourneyInTemplateList()
  }
  async createAndVerifyTemplate() {
    await this.clickOnTheCreatedCustomJourney()
    await this.clickThreeDotBtnOfCustomJourney()
    await this.clickCreateTempleteOrTemplateSettingsOption('Create Template')
    await this.backToHome()
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
      this.page.locator('a[data-testid="NavigationListItemProjects"]')
    ).toBeVisible()
    await this.page
      .locator('a[data-testid="NavigationListItemProjects"]')
      .click()
    await expect(
      this.page.locator(
        'a[data-testid="NavigationListItemProjects"][class*="Mui-selected"]'
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
    await this.verifyBulkActionDialogText(
      'This will archive all active Journeys you own.'
    )
    await this.clickDialogBoxBtn('Archive')
    await this.verifySnackbarToastMessage('Journeys Archived')
    await this.verifyActiveTabShowsEmptyMessage()
    await this.clickArchivedTab()
    await this.verifyAllJourneyMovedToArchivedTab()
  }

  // 'Trash All' is reachable from both the active and archived views and the
  // dialog wording differs, so the caller says which one it is.
  async verifyAllJourneysMovedToTrash(fromStatus: 'active' | 'archived') {
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Trash All')
    await this.verifyBulkActionDialogText(
      fromStatus === 'active'
        ? 'This will trash all active Journeys you own.'
        : 'This will trash all archived Journeys you own.'
    )
    await this.clickDialogBoxBtn('Trash')
    await this.verifySnackbarToastMessage('Journeys Trashed')
    await this.clickTrashTab()
    await this.verifyAllJourneyMovedToTrashTab()
  }

  async verifyAllJourneysRestored() {
    await this.getJourneyListOfTrashTab()
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Restore All')
    await this.verifyBulkActionDialogText(
      'This will restore all trashed Journeys you own.'
    )
    await this.clickDialogBoxBtn('Restore')
    await this.verifySnackbarToastMessage('Journeys Restored')
    await this.clickActiveTab()
    await this.verifyAllJourneyMovedToActiveTab()
  }

  async verifyAllJourneysDeletedForeverFromTrashTab() {
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Delete All Forever')
    await this.verifyBulkActionDialogText(
      'This will permanently delete all trashed Journeys you own.'
    )
    await this.clickDialogBoxBtn('Delete Forever')
    await this.verifySnackbarToastMessage('Journeys Deleted')
    await this.verifyAlljourneysAreDeletedFromTrashTab()
  }

  async verifyAllJourneysMovedFromArchivedToActiveTab() {
    await this.clickThreeDotBesideSortByOption()
    await this.selectThreeDotOptionsBesideSortByOption('Unarchive All')
    await this.verifyBulkActionDialogText(
      'This will unarchive all archived Journeys you own.'
    )
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
    await this.clickEditDetailsInThreeDotOptions()
    await this.enterTitle()
    await this.clickSaveBtn()
    await this.verifyJourneyTitleGotUpdated()
    await this.backToHome()
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
    const createButton = this.page.getByRole('button', {
      name: 'Create Custom Journey'
    })
    // 90s: cold Vercel SSR + TeamProvider Apollo query can take time on first load
    await expect(createButton).toBeEnabled({ timeout: 90000 })
    await createButton.click()
    const journeyImageLoader = this.page.locator(
      'div[data-testid="JourneysAdminImageThumbnail"] span[class*="MuiCircularProgress"]'
    )
    await expect(journeyImageLoader).toBeHidden({
      timeout: sixtySecondsTimeout
    })
  }

  async setJourneyName(journey: string) {
    journeyName =
      (journey === 'firstJourneyName'
        ? testData.journey.firstJourneyName
        : testData.journey.secondJourneyName) + generateRandomNumber(3)
  }

  // The desktop layered editor opens map-first with the card inside a closed
  // modal drawer, so the card iframe is not mounted until a step node is
  // clicked. The mobile slider keeps every slide mounted, so this is a no-op.
  async openLayeredCardEditor(): Promise<void> {
    if (
      (await this.page.locator('div[data-testid="EditorCanvas"]').count()) > 0
    ) {
      return
    }
    await this.page.locator('[data-testid^="StepBlockNode-"]').first().click()
    await expect(
      this.page.locator('div[data-testid="EditorCanvas"]').first()
    ).toBeVisible({ timeout: thirtySecondsTimeout })
  }

  async enterJourneysTypography(): Promise<void> {
    await this.openLayeredCardEditor()
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
      }
      await this.page
        .frameLocator(this.journeyCardFrame)
        .first()
        .locator(
          'div[data-testid="CardWrapper"] div[data-testid*="SelectableWrapper"] h3[data-testid="JourneysTypography"]'
        )
        .first()
        .click({ timeout: sixtySecondsTimeout, delay: 1000 })
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
    // On the desktop layered editor the card lives in a modal drawer; closing
    // it via its backdrop commits the inline edit and uncovers the toolbar.
    // The mobile slider has no modal overlay, so tap the Fab instead.
    if (
      (await this.page.locator('div[data-testid="LayeredView"]').count()) > 0
    ) {
      await this.page
        .locator('div[data-testid="LayeredViewDrawer"] .MuiBackdrop-root')
        .first()
        // the backdrop sits behind the floating card (z-index -1), so its
        // centre is covered by the card; click the exposed dimmed margin
        // (top-left) to dismiss, as a user would
        .click({ position: { x: 40, y: 40 } })
      await expect(
        this.page.locator('div[data-testid="EditorCanvas"]')
      ).toBeHidden({ timeout: thirtySecondsTimeout })
      return
    }
    await this.page.locator('button[data-testid="Fab"]').click()
  }

  // On the desktop layered editor an open card drawer is a modal whose backdrop
  // covers the toolbar, so close it before reaching for a toolbar action. No-op
  // on the mobile slider (no modal) or when the drawer is already closed.
  async ensureLayeredDrawerClosed(): Promise<void> {
    if (
      (await this.page.locator('div[data-testid="LayeredView"]').count()) ===
        0 ||
      (await this.page.locator('div[data-testid="EditorCanvas"]').count()) === 0
    ) {
      return
    }
    await this.page
      .locator('div[data-testid="LayeredViewDrawer"] .MuiBackdrop-root')
      .first()
      // click the exposed dimmed margin (top-left); the backdrop's centre is
      // covered by the floating card (z-index -1)
      .click({ position: { x: 40, y: 40 } })
    await expect(
      this.page.locator('div[data-testid="EditorCanvas"]')
    ).toBeHidden({ timeout: thirtySecondsTimeout })
  }

  async clickThreeDotBtnOfCustomJourney(): Promise<void> {
    await this.ensureLayeredDrawerClosed()
    await this.page.locator('button#edit-journey-actions').click()
  }

  async clickEditDetailsInThreeDotOptions() {
    await this.page
      .locator(
        'ul[aria-labelledby="edit-journey-actions"] li[role="menuitem"]',
        { hasText: 'Edit Details' }
      )
      .click()
  }

  async enterTitle() {
    await this.setNewJourneyName()
    await this.page.locator('input#title').click({ delay: 2000 })
    await this.page.locator('input#title').clear()
    await this.page.locator('input#title').fill(journeyName)
  }

  async clickSaveBtn() {
    await this.page
      .locator('div[role="dialog"] button', { hasText: 'Save' })
      .click({ delay: 3000 })
    await expect(this.page.getByTestId('JourneyDetailsDialog')).toBeHidden({
      timeout: thirtySecondsTimeout
    })
  }

  async backToHome() {
    await this.page.locator('a[data-testid="NextStepsLogo"]').click()
  }

  async verifyCreatedCustomJourneyInActiveList() {
    await expect(
      this.page.locator(this.journeyNamePath, {
        hasText: journeyName
      })
    ).toBeVisible({ timeout: thirtySecondsTimeout })
  }

  async clickOnTheCreatedCustomJourney() {
    await this.page
      .locator(this.journeyNamePath, {
        hasText: journeyName
      })
      .click()
    await expect(
      this.page.locator('div[data-testid="StrategyItem"] button')
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async clickCreateTempleteOrTemplateSettingsOption(
    optionName = 'Create Template'
  ) {
    await this.page
      .locator(
        'ul[aria-labelledby="edit-journey-actions"] li[role="menuitem"]',
        { hasText: optionName }
      )
      .click({ delay: 3000 })
    // verifying that the 'Create Template' option is disappeared, if not once again clicking on that option
    try {
      await expect(
        this.page.locator(
          'ul[aria-labelledby="edit-journey-actions"] li[role="menuitem"]',
          { hasText: 'Create Template' }
        )
      ).toBeHidden({ timeout: sixtySecondsTimeout })
    } catch {
      await this.page
        .locator(
          'ul[aria-labelledby="edit-journey-actions"] li[role="menuitem"]',
          { hasText: 'Create Template' }
        )
        .click({ delay: 3000 })
    }
    await this.page.waitForURL('**/publisher/**', { timeout: 60000 })
  }

  async verifyCreatedJourneyInTemplateList() {
    await expect(
      this.page
        .locator(
          'div[aria-label="journey-card"] div[class*="MuiCardContent"] h6',
          { hasText: journeyName }
        )
        .first()
    ).toBeVisible({ timeout: thirtySecondsTimeout })
  }

  async clickThreeDotOfCreatedNewTemple() {
    // The menu box sits before the card link, and the inner IconButton is
    // pointer-events: none, so click the box that owns the handler instead.
    await this.page
      .locator('div[aria-label="journey-card"]', { hasText: journeyName })
      .getByTestId('JourneyCardMenuButton')
      .first()
      .click()
  }

  async clickArchiveOption() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItemArchive"]')
      .click()
  }

  // Discover renders a single 'Team Projects' panel whose contents change with
  // the status filter — the per-status tab panels only exist on Publisher now.
  // Matched by regex because the label is 'Team Projects' above the sm
  // breakpoint and 'Projects' below it.
  journeysTabPanel() {
    return this.page.getByRole('tabpanel', { name: /Projects/ })
  }

  // All three status views are the same panel now, so capturing and comparing
  // the visible journeys no longer varies by status — only the filter set
  // beforehand does. Kept behind the per-status method names the specs call.
  async captureJourneyList() {
    const journeys = this.journeysTabPanel().locator(this.journeyNamePath)
    await expect(journeys.first()).toBeVisible({
      timeout: thirtySecondsTimeout
    })
    this.journeyList = await journeys.allInnerTexts()
  }

  async verifyCapturedJourneysArePresent() {
    const journeys = this.journeysTabPanel().locator(this.journeyNamePath)
    await expect(journeys.first()).toBeVisible({
      timeout: thirtySecondsTimeout
    })
    const visibleJourneys = await journeys.allInnerTexts()
    const matchCount = this.journeyList.filter((journey) =>
      visibleJourneys.includes(journey)
    ).length
    expect(matchCount === this.journeyList.length).toBeTruthy()
  }

  // Status is a filter on Discover, not a tab. Driven the same way as the sort
  // control in clickSortByIcon/clickSortOpion — both are the same RadioSelect.
  async selectJourneyStatus(status: string) {
    const statusFilter = this.page.getByRole('button', {
      name: 'Filter by status'
    })
    const visible = await statusFilter.isVisible().catch(() => false)
    if (!visible) {
      const baseUrl = await getBaseUrl()
      const discoverUrl = baseUrl.replace(/\/$/, '') + '/?type=journeys'
      await this.page.goto(discoverUrl, { waitUntil: 'domcontentloaded' })
    }
    await expect(statusFilter).toBeVisible({ timeout: sixtySecondsTimeout })
    await statusFilter.click()
    const option = this.page.getByRole('radio', { name: status })
    await expect(option).toBeVisible({ timeout: thirtySecondsTimeout })
    await option.click()
    // The trigger renders the selected label, so this confirms the filter took.
    await expect(statusFilter).toContainText(status, {
      timeout: thirtySecondsTimeout
    })
  }

  async clickArchivedTab() {
    await this.selectJourneyStatus('Archived')
  }

  async verifyCreatedNewTemplateMovedToArchiveOrNot() {
    await expect(
      this.page.locator(
        'div[id*="archived-status-panel-tabpanel"] div[aria-label="journey-card"] div[class*="MuiCardContent"] h6',
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
    await this.selectJourneyStatus('Trash')
  }

  async verifyCreatedNewTemplateMovedToTrashTabOrNot() {
    await expect(
      this.page.locator(
        'div[id*="trashed-status-panel-tabpanel"] div[aria-label="journey-card"] div[class*="MuiCardContent"] h6',
        { hasText: journeyName }
      )
    ).toBeVisible()
  }

  async clickThreeDotOfCreatedNewJourney() {
    const threeDotBtnPath = this.page
      .locator('div[aria-label="journey-card"]', { hasText: journeyName })
      .first()
      .locator('[data-testid="JourneyCardMenuButton"]')
      .first()
    await expect(threeDotBtnPath).toBeVisible({ timeout: thirtySecondsTimeout })
    await threeDotBtnPath.click()
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
      this.journeysTabPanel().locator(this.journeyNamePath, {
        hasText: journeyName
      })
    ).toBeVisible()
  }

  async clickActiveTab() {
    await this.selectJourneyStatus('Active')
  }

  async clickRestoreBtn() {
    await this.page
      .locator('div[role="dialog"] button', { hasText: 'Restore' })
      .click()
  }

  async verifyCreatedNewJourneyMovedToActiveTabOrNot() {
    await expect(
      this.journeysTabPanel().locator(this.journeyNamePath, {
        hasText: journeyName
      })
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
        'div[id*="trashed-status-panel-tabpanel"] div[aria-label="journey-card"] div[class*="MuiCardContent"] h6',
        { hasText: journeyName }
      )
    ).toBeHidden()
  }

  async getJourneyName() {
    return journeyName
  }

  async clickThreeDotOfExistingJourney() {
    this.existingJourneyName = await this.page
      .locator(this.journeyNamePath, {
        hasNotText: 'Untitled Journey'
      })
      .first()
      .innerText()
    await this.page
      .locator('div[aria-label="journey-card"]', {
        hasNotText: 'Untitled Journey'
      })
      .first()
      .locator('[data-testid="JourneyCardMenuButton"]')
      .first()
      .click()
  }

  async setExistingJourneyNameToJourneyName() {
    journeyName = this.existingJourneyName
  }

  async verifyJourneyMovedToArchiveOrNot() {
    await expect(
      this.journeysTabPanel().locator(this.journeyNamePath, {
        hasText: journeyName
      })
    ).toBeVisible()
  }

  async verifyJourneyDeletedForeverInTrashTab() {
    await expect(
      this.journeysTabPanel().locator(this.journeyNamePath, {
        hasText: journeyName
      })
    ).toHaveCount(0)
  }

  async clickUnarchiveOption() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItemUnarchive"]')
      .click()
  }

  async clickThreeDotBesideSortByOption() {
    // 'journey status tabs' is StatusTabPanel, which only Publisher renders.
    // Discover's tab strip is labelled 'journey content type tabs'.
    await this.page
      .locator(
        'div[aria-label="journey content type tabs"] button[data-testid="JourneyListMenuButton"]'
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
    await this.captureJourneyList()
  }

  // Team-page bulk dialogs pair a specific sentence with a shared prompt, so
  // both lines are checked. exact: true means a casing or wording change fails
  // instead of slipping through a substring match.
  async verifyBulkActionDialogText(message: string) {
    const dialog = this.page.getByRole('dialog')
    await expect(dialog.getByText(message, { exact: true })).toBeVisible()
    await expect(
      dialog.getByText('Are you sure you want to proceed?', { exact: true })
    ).toBeVisible()
  }

  async clickDialogBoxBtn(buttonName) {
    await this.page
      .locator('div[data-testid="dialog-action"] button', {
        hasText: buttonName
      })
      .click()
  }

  async getCurrentUrl() {
    console.log(`current Url is ${this.page.url()}`)
  }

  async verifyAllJourneyMovedToArchivedTab() {
    await this.verifyCapturedJourneysArePresent()
  }

  async verifyActiveTabShowsEmptyMessage() {
    // exact: true pins the casing — see verifyActiveTabShowsEmptyMessage in
    // publisher-and-templates-page.ts for why hasText was not enough.
    await expect(
      this.journeysTabPanel().getByRole('heading', {
        name: 'No Journeys to display.',
        exact: true
      })
    ).toBeVisible()
  }

  async getJourneyListOfArchivedTab() {
    await this.captureJourneyList()
  }

  async verifyAllJourneyMovedToTrashTab() {
    await this.verifyCapturedJourneysArePresent()
  }

  async getJourneyListOfTrashTab() {
    await this.captureJourneyList()
  }

  async verifyAllJourneyMovedToActiveTab() {
    await this.verifyCapturedJourneysArePresent()
  }

  async verifyAlljourneysAreDeletedFromTrashTab() {
    // Dropped .first() — it resolves to at most one element, so toHaveCount(0)
    // could never see more than one leftover journey.
    await expect(
      this.journeysTabPanel().locator(this.journeyNamePath)
    ).toHaveCount(0)
    await expect(
      this.journeysTabPanel().getByRole('heading', {
        name: 'Your trashed Journeys will appear here.',
        exact: true
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
      this.journeysTabPanel().getByRole('heading', {
        name: 'No archived Journeys.',
        exact: true
      })
    ).toBeVisible()
  }

  async clickSortByIcon() {
    const sortByButton = this.page.getByRole('button', {
      name: /Sort By/i
    })
    await expect(sortByButton).toBeVisible({ timeout: thirtySecondsTimeout })
    await sortByButton.click()
  }

  async clickSortOpion(sortOption: string) {
    const option = this.page.getByRole('radio', { name: sortOption })
    await expect(option).toBeVisible({ timeout: thirtySecondsTimeout })
    await option.click()
  }

  async verifySelectedSortOptionInSortByIcon(selectedSortOption: string) {
    await expect(
      this.page.getByRole('button', { name: /Sort By/i })
    ).toContainText(selectedSortOption, { timeout: thirtySecondsTimeout })
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
      .locator(this.journeyNamePath)
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
      .locator(this.journeyNamePath)
      .allInnerTexts()
    await this.sortTheListToAscendingOrder(journeyList, journeyExpectedList)
  }

  async sortTheListToAscendingOrder(
    list: string[],
    expectedSortedList: string[]
  ) {
    list
      .map((str) => str.toLowerCase())
      .sort((a, b) => Intl.Collator().compare(a, b))
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
      .locator(this.journeyNamePath)
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
        .locator(this.journeyNamePath)
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
        .locator(this.journeyNamePath)
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
        hasText: 'See All'
      })
    ).toHaveAttribute('href', '/templates')
  }

  async verifySeeAllTemplateBelowUseTemplate() {
    await expect(
      this.page.locator('div[data-testid="SidePanelContainer"] a', {
        hasText: 'See All Templates'
      })
    ).toHaveAttribute('href', '/templates')
  }

  async clickPreviewBtnInCustomJourneyPage() {
    await this.page
      .locator('div[data-testid="PreviewItem"] a[aria-label="Preview"]')
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
    expect(tabName.includes(journeyName)).toBeTruthy()
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
      .locator(this.journeyNamePath, {
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
    await this.page
      .locator('div[aria-label="journey-card"]', {
        hasText: this.existingJourneyName
      })
      .locator('div[data-testid="AnalyticsItem"] a')
      .click()
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
      .waitFor({ state: 'visible', timeout: sixtySecondsTimeout })
    await this.page
      .frameLocator(this.journeyCardFrame)
      .first()
      .locator('div[data-testid="CardOverlayImageContainer"]')
      .first()
      .click()
  }

  async enterJourneysTypographyForTemplate(): Promise<void> {
    let typographyPath: string
    let textareaPath: string
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
      }
      await this.page
        .frameLocator(this.journeyCardFrame)
        .first()
        .locator(typographyPath)
        .first()
        .click({ timeout: sixtySecondsTimeout, delay: 1000 })
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

  async clickShareButtonInJourneyPage() {
    const shareButton = this.page
      .locator('div[data-testid="ShareItem"]')
      .getByRole('button', { name: 'Share' })
    // 90s: cold Vercel SSR can delay journey page render after navigation from card click
    await expect(shareButton).toBeVisible({ timeout: 90000 })
    await shareButton.click()
  }

  async clickCopyIconInShareDialog() {
    await this.page
      .locator('div.MuiDialogContent-root button[aria-label="Copy"]')
      .click()
  }

  async clickButtonInShareDialog(buttonName: string) {
    //Edit URL, Embed Journey,  QR Code, Generate Code, Download PNG
    await this.page
      .locator('div.MuiDialogContent-root')
      .getByRole('button', { name: buttonName })
      .click()
  }
  async UpdateUrlSlug() {
    const slugNameToInclude = 'edited-slug'
    const slugField_path = this.page.locator(
      'div.MuiDialogContent-root input#slug'
    )
    await slugField_path.pressSequentially(slugNameToInclude, { delay: 200 })
    await expect(slugField_path).toHaveValue(new RegExp(slugNameToInclude))
    return slugNameToInclude
  }
  async clickDialogActionBtnsInShareDialog(buttonName: string) {
    //Copy Code, Save, Cancel
    await this.page
      .locator('div.MuiDialogActions-root')
      .getByRole('button', { name: buttonName })
      .click()
  }
  async verifyUpdatedUrlSlugIsLoaded(linkToCheck: string) {
    const copiedLinkPage = await this.context.newPage()
    const clipBoardText = await this.page.evaluate(
      'navigator.clipboard.readText()'
    )
    await copiedLinkPage.goto(clipBoardText)
    await copiedLinkPage.waitForLoadState()
    const tabName: string = await copiedLinkPage.title()
    expect(tabName.includes(this.existingJourneyName)).toBeTruthy()
    const loadedLink: string = copiedLinkPage.url()
    expect(loadedLink).toStrictEqual(linkToCheck)
  }

  async getUrlfromShareDialogPopup() {
    return await this.page
      .locator('div.MuiDialogContent-root input:not(#slug)')
      .inputValue()
  }
  async validateUrlInEmbedCodeFieldAndReturnEmbedCode() {
    const embedUrlFieldValue = await this.page
      .locator('div.MuiDialogContent-root textarea#embed-url')
      .inputValue()
    return embedUrlFieldValue
  }
  async validateCopiedValues(actualValue: string) {
    const clipBoardText = await this.page.evaluate(
      'navigator.clipboard.readText()'
    )
    expect(actualValue).toStrictEqual(clipBoardText)
  }
  async validateCopiedValueContainsExpectedValue(actualValue: string) {
    const clipBoardText = await this.page.evaluate(
      'navigator.clipboard.readText()'
    )
    expect(clipBoardText).toContain(actualValue)
  }
  async editUrlAndSave() {
    await this.clickButtonInShareDialog('Edit Link')
    const updatedSlugName = await this.UpdateUrlSlug()
    await this.clickDialogActionBtnsInShareDialog('Save')
    await this.validateUrlUpdatedUrl(updatedSlugName)
    const updatedUrlSlug = await this.getUrlfromShareDialogPopup()
    return updatedUrlSlug
  }
  async validateUrlUpdatedUrl(valueToCheck: string) {
    await expect(
      this.page.locator('div.MuiDialogContent-root input:not(#slug)')
    ).toHaveValue(new RegExp(valueToCheck))
  }

  async validateQRCodeGenerated() {
    await expect(
      this.page.locator('div.MuiDialogContent-root canvas#qr-code-download')
    ).toBeVisible()
  }
  async clickDownloadDropDownAndSelectCopyShortLink() {
    const dropdownBtn = this.page.locator(
      'div.MuiDialogContent-root button[data-testid="DownloadDropdown"]'
    )
    await expect(dropdownBtn).toBeVisible({ timeout: thirtySecondsTimeout })
    await expect(dropdownBtn).toBeEnabled({ timeout: thirtySecondsTimeout })
    await dropdownBtn.click()
    const menuItem = this.page
      .locator('div.MuiDialogContent-root div[role="tooltip"]')
      .getByRole('menuitem', { name: 'Copy Short Link' })
    await expect(menuItem).toBeVisible({ timeout: thirtySecondsTimeout })
    await menuItem.click()
  }
  async downloadQRCodeAsPng() {
    const qrDownload = this.page.waitForEvent('download', { timeout: 60000 })
    await this.clickButtonInShareDialog('Download PNG')
    const downloadFile = await qrDownload
    this.downloadedQrFile = downloadFile.suggestedFilename()

    if (!fs.existsSync(downloadFolderPath)) {
      fs.mkdirSync(downloadFolderPath)
    }

    await downloadFile.saveAs(
      path.join(downloadFolderPath, this.downloadedQrFile)
    )
  }
  async validateDownloadedQrPngFile() {
    const isFileExist = fs.existsSync(
      path.join(downloadFolderPath, this.downloadedQrFile)
    )
    expect(isFileExist && this.downloadedQrFile.includes('.png'), {
      message: `Downloaded QR COde png file(${this.downloadedQrFile}) should be exist`
    }).toBeTruthy()
  }
  async clickCloseIconForQrCodeDialog(): Promise<void> {
    // Target only the close button in the QR Code dialog
    await this.page
      .locator(
        'div[role="dialog"]:has(h2:has-text("QR Code")) button[data-testid="dialog-close-button"]'
      )
      .click()
  }
  async validateUrlFieldInShareDialog(expectedValue: string) {
    await expect(
      this.page.locator('div.MuiDialogContent-root input')
    ).toHaveValue(new RegExp(expectedValue))
  }
}
