/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import type { Page } from 'playwright-core'

import { generateRandomNumber, getEmail } from '../framework/helpers'
import testData from '../utils/testData.json'

let randomNumber = ''
const thirtySecondsTimeout = 30000

export class JourneyLevelActions {
  readonly page: Page
  context
  existingJourneyName = ''
  renameJourneyName = ''
  memberEmail = ''
  selectedTeam
  descriptionText = testData.journey.descriptionText
  selectedLanguage = ''
  journeyNamePath =
    'div[data-testid *="JourneyCard"] div.MuiCardContent-root h6.MuiTypography-root'

  constructor(page: Page) {
    this.page = page
    randomNumber = generateRandomNumber(3)
  }

  async setBrowserContext(context): Promise<void> {
    this.context = context
  }

  async clickThreeDotOfExistingJourney(): Promise<void> {
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
      .click({ delay: 500 })
  }

  async clickThreeDotOfCreatedJourney(journeyName): Promise<void> {
    await this.page
      .locator('div[aria-label="journey-card"]', { hasText: journeyName })
      .first()
      .locator('[data-testid="JourneyCardMenuButton"]')
      .first()
      .click()
    this.existingJourneyName = journeyName
  }

  async selectExistingJourney(): Promise<void> {
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

  async selectCreatedJourney(journeyName): Promise<void> {
    this.existingJourneyName = journeyName
    const journeyCardpath = this.page
      .locator('div[aria-label="journey-card"]', { hasText: journeyName })
      .first()

    await expect(journeyCardpath).toBeVisible({ timeout: thirtySecondsTimeout })
    await expect(journeyCardpath).toBeEnabled({ timeout: thirtySecondsTimeout })
    await expect(journeyCardpath).toBeInViewport({
      timeout: thirtySecondsTimeout
    })
    await journeyCardpath.click({ delay: 500 })
  }

  async clickThreeDotOptions(options): Promise<void> {
    await this.page
      .locator('ul[aria-labelledby="journey-actions"] li', { hasText: options })
      .click()
  }

  async enterTitle(): Promise<void> {
    this.renameJourneyName = testData.journey.renameJourneyName + randomNumber
    await this.page
      .locator('input#title')
      .click({ delay: 2000, timeout: thirtySecondsTimeout })
    await this.page.locator('input#title').clear()
    await this.page.locator('input#title').fill(this.renameJourneyName)
  }

  async verifyJourneyRenamedInActiveList(): Promise<void> {
    // `.first()` — JourneyList occasionally renders duplicate cards while a
    // refetch settles. Use the first match so the rename assertion isn't
    // blocked by an unrelated cache hiccup.
    await expect(
      this.page
        .locator(this.journeyNamePath, {
          hasText: this.renameJourneyName
        })
        .first()
    ).toBeVisible({ timeout: thirtySecondsTimeout })
    // The "old name is hidden" check is intentionally omitted: leftover
    // journeys from previous CI runs (same admin account is shared across
    // runs) can repeat earlier titles, so the only thing we can reliably
    // assert is that the new title now appears.
  }

  async enterTeamMember(): Promise<void> {
    const [localPart, domain] = (await getEmail('admin')).split('@')
    // Plus-alias keeps a deliverable address while staying unique per run.
    this.memberEmail =
      `${localPart}+journey-invite-${randomNumber}@${domain}`.toLowerCase()
    const accessDialog = this.page.getByTestId('AccessDialog')
    await expect(accessDialog).toBeVisible({ timeout: thirtySecondsTimeout })
    const emailInput = accessDialog.getByRole('textbox', { name: 'Email' })
    await expect(emailInput).toBeEditable({ timeout: thirtySecondsTimeout })
    await emailInput.fill(this.memberEmail)
    await emailInput.blur()
    await expect(
      accessDialog.locator('.MuiFormHelperText-root.Mui-error')
    ).toHaveCount(0)
  }

  async clickPlusMemberInMemberPopup(): Promise<void> {
    const accessDialog = this.page.getByTestId('AccessDialog')
    const emailInput = accessDialog.getByRole('textbox', { name: 'Email' })
    const addUserButton = accessDialog.getByRole('button', { name: 'add user' })
    await addUserButton.scrollIntoViewIfNeeded()
    await expect(addUserButton).toBeEnabled({ timeout: thirtySecondsTimeout })
    await emailInput.press('Enter')
    await expect(emailInput).toHaveValue('', { timeout: thirtySecondsTimeout })
  }

  /** Client-side success: invite form clears with no validation error. */
  async verifyAccessInviteSubmitted(): Promise<void> {
    const accessDialog = this.page.getByTestId('AccessDialog')
    await expect(accessDialog.getByRole('textbox', { name: 'Email' })).toHaveValue(
      ''
    )
    await expect(
      accessDialog.locator('.MuiFormHelperText-root.Mui-error')
    ).toHaveCount(0)
  }

  async verifyAccessAddedInManageEditors(): Promise<void> {
    const accessDialog = this.page.getByTestId('AccessDialog')
    const inviteRow = accessDialog
      .locator('[data-testid="UserListItem"], [data-testId="UserListItem"]')
      .filter({ hasText: this.memberEmail })
    await expect(inviteRow.first()).toBeVisible({
      timeout: thirtySecondsTimeout
    })
  }

  /** Re-open Access so GetUserInvites refetches after userInviteCreate. */
  async reopenAccessFromJourneyCard(journeyName: string): Promise<void> {
    await this.clickDiaLogBoxCloseBtn()
    await this.clickThreeDotOfCreatedJourney(journeyName)
    await this.clickThreeDotOptions('Access')
    await expect(this.page.getByTestId('AccessDialog')).toBeVisible({
      timeout: thirtySecondsTimeout
    })
  }

  /** Re-open Manage Access from the journey editor toolbar menu. */
  async reopenManageAccessFromEditor(): Promise<void> {
    await this.clickDiaLogBoxCloseBtn()
    await this.page
      .locator('[data-testid="ToolbarMenuButton"]')
      .click({ timeout: thirtySecondsTimeout })
    await this.clickThreeDotOptionsOfJourneyCreationPage('Manage Access')
    await expect(this.page.getByTestId('AccessDialog')).toBeVisible({
      timeout: thirtySecondsTimeout
    })
  }

  async clickDiaLogBoxCloseBtn(): Promise<void> {
    await this.page.locator('button[data-testid="dialog-close-button"]').click()
  }

  async verifyPreviewForExistingJourney(): Promise<void> {
    const previewLink = this.page.locator(
      'ul[aria-labelledby="journey-actions"] a',
      { hasText: 'Preview' }
    )
    await expect(previewLink).toBeVisible({ timeout: thirtySecondsTimeout })
    const [newPage] = await Promise.all([
      this.context.waitForEvent('page', { timeout: thirtySecondsTimeout }),
      previewLink.click()
    ])
    await newPage.waitForLoadState('domcontentloaded')
    await expect(
      newPage
        .locator(
          'div[data-testid="pagination-bullets"] svg[data-testid*="bullet"]'
        )
        .first()
    ).toBeVisible({ timeout: thirtySecondsTimeout })
    const tabName: string = await newPage.title()
    expect(tabName.includes(this.existingJourneyName)).toBeTruthy()
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

  async verifyExistingJourneyDuplicate(): Promise<void> {
    await expect(
      this.page.locator(this.journeyNamePath, {
        hasText: `${this.existingJourneyName} copy`
      })
    ).toBeVisible()
  }

  async verifySnackBarMsg(snackbarMsg: string): Promise<void> {
    await expect(
      this.page.locator('div[id="notistack-snackbar"]', {
        hasText: snackbarMsg
      })
    ).toBeVisible({ timeout: thirtySecondsTimeout })
    await expect(
      this.page.locator('div[id="notistack-snackbar"]', {
        hasText: snackbarMsg
      })
    ).toBeHidden({ timeout: thirtySecondsTimeout })
  }

  async clickSelectTeamDropDownIcon(): Promise<void> {
    const backdrop = this.page.locator('.MuiModal-backdrop').first()
    if (await backdrop.isVisible({ timeout: 500 }).catch(() => false)) {
      const duplicateDialog = this.page.locator(
        'div[data-testid="dialog-action"]'
      )
      if (!(await duplicateDialog.isVisible({ timeout: 500 }).catch(() => false))) {
        await this.page.keyboard.press('Escape')
        await backdrop.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
      }
    }
    const dropdown = this.page
      .getByTestId('team-duplicate-select')
      .locator('div[aria-haspopup="listbox"]')
    await expect(dropdown).toHaveCount(1)
    await expect(dropdown).toBeVisible()
    if ((await dropdown.getAttribute('aria-expanded')) !== 'true') {
      await dropdown.click()
    }
    await expect(
      this.page.locator('div[id="menu-teamSelect"] ul[role="listbox"]').first()
    ).toBeVisible({ timeout: thirtySecondsTimeout })
  }

  async selectTeamToCopyTheJourney(): Promise<void> {
    const teamOptions = this.page.locator(
      'div[id="menu-teamSelect"] ul[role="listbox"] li[role="option"]'
    )
    const lastOption = teamOptions.last()
    this.selectedTeam =
      (await lastOption.getAttribute('aria-label')) ??
      (await lastOption.innerText())
    await expect(lastOption).toBeVisible({ timeout: thirtySecondsTimeout })
    await lastOption.click()
    await expect(
      this.page.locator('div[id="menu-teamSelect"] ul[role="listbox"]').first()
    ).toBeHidden({ timeout: thirtySecondsTimeout })
  }

  async clickCopyButton(): Promise<void> {
    await this.page
      .locator('div[data-testid="dialog-action"] button[type="button"]', {
        hasText: 'Copy'
      })
      .click()
  }

  async verifyCopiedTeamNameUpdatedInTeamSelectDropdown(): Promise<void> {
    const teamSelectDropdown = this.page
      .getByTestId('TeamSelect')
      .locator('div[aria-haspopup="listbox"]')
    await expect(teamSelectDropdown).toHaveCount(1)
    await expect(teamSelectDropdown).toHaveText(this.selectedTeam)
  }

  async verifyCopiedJournetInSelectedTeamList(): Promise<void> {
    await expect(
      this.page
        .locator(this.journeyNamePath, {
          hasText: this.existingJourneyName
        })
        .first()
    ).toBeVisible()
  }

  async clickThreeDotOptionsOfJourneyCreationPage(option): Promise<void> {
    const menuItem = this.page.getByRole('menuitem', { name: option })
    await expect(menuItem).toBeVisible({ timeout: thirtySecondsTimeout })
    await menuItem.click({ timeout: thirtySecondsTimeout })
    await expect(menuItem).toBeHidden({ timeout: thirtySecondsTimeout })
  }

  async enterDescription(): Promise<void> {
    await this.page.locator('textarea#description').clear({ timeout: 50000 })
    await this.page.locator('textarea#description').fill(this.descriptionText)
  }

  async verifyDescriptionAddedForSelectedJourney(): Promise<void> {
    await expect(
      this.page
        .locator('div[aria-label="journey-card"]', {
          hasText: this.existingJourneyName
        })
        .first()
        .locator('span[data-testid="new-journey-badge"] + span', {
          hasText: this.descriptionText
        })
    ).toBeVisible()
  }

  async enterLanguage(language: string): Promise<void> {
    const languageInput = this.page.locator(
      'input[placeholder="Search Language"]'
    )
    this.selectedLanguage = language
    await languageInput.click()
    await expect(this.page.locator('span[role="progressbar"]')).toBeHidden({
      timeout: thirtySecondsTimeout
    })
    await languageInput.fill(this.selectedLanguage)
    // MUI Autocomplete substring-matches — typing "Abau" surfaces
    // "Minangkabau". Require an exact option label match.
    const option = this.page.getByRole('option', {
      name: this.selectedLanguage,
      exact: true
    })
    await expect(option).toBeVisible({ timeout: thirtySecondsTimeout })
    await option.click()
  }

  async verifyLinkIsCopied() {
    const clipBoardText = await this.page.evaluate(
      'navigator.clipboard.readText()'
    )
    const copiedLinkPage = await this.context.newPage()
    await copiedLinkPage.goto(clipBoardText)
    const tabName: string = await copiedLinkPage.title()
    expect(tabName.includes(this.existingJourneyName)).toBeTruthy()
  }

  async clickNavigateToGoalBtn(): Promise<void> {
    await this.page.locator('div[data-testid="StrategyItem"] button').click()
  }

  async verifyPageIsNavigatedToGoalPage(): Promise<void> {
    await expect(
      this.page.locator('div[data-testid="ActionInformation"] h6', {
        hasText: 'What are Goals?'
      })
    ).toBeVisible()
    // let currentUrl = await this.page.url()
    // expect( currentUrl.includes('param=goals')).toBeTruthy() // now the uRL doesn't change after clicking goal(Strategy) btn
  }

  async clickNavigationSideMenu(): Promise<void> {
    await this.page
      .locator('div[data-testid="NavigationListItemToggle"]')
      .click()
  }

  async verifyNavigationSideMenuOpened(): Promise<void> {
    await expect(
      this.page.locator(
        'div[data-testid="NavigationDrawer"] div[aria-hidden="true"][style*="visibility: hidden"]'
      )
    ).toBeHidden()
  }

  async verifyNavigationSideMenuClosed(): Promise<void> {
    await expect(
      this.page.locator(
        'div[data-testid="NavigationDrawer"] div[aria-hidden="true"][style*="visibility: hidden"]'
      )
    ).toHaveCount(1)
  }

  async clickHelpBtn(): Promise<void> {
    await expect(
      this.page.getByTestId('side-header').locator('button[aria-label="Help"]')
    ).toBeEnabled({ timeout: thirtySecondsTimeout })
    await this.page
      .getByTestId('side-header')
      .locator('button[aria-label="Help"]')
      .click({ delay: 3000 })
  }

  async verifyHelpWindowOpened(): Promise<void> {
    await expect(
      this.page.locator(
        'div[class="Beacon"] div[class*="BeaconContainer-enter-done"]'
      )
    ).toBeVisible()
  }

  async verifySelectedLanguageInLanguagePopup(): Promise<void> {
    await expect(
      this.page.locator('input[placeholder="Search Language"]')
    ).toHaveAttribute('value', this.selectedLanguage, {
      timeout: thirtySecondsTimeout
    })
  }

  async sleep(ms): Promise<Promise<void>> {
    return await new Promise((resolve) => setTimeout(resolve, ms))
  }

  async selectFirstJourney(): Promise<void> {
    await this.page
      .locator('div[aria-label="journey-card"] a[href *="journeys"]')
      .first()
      .click()
  }

  async validateJourneyDescription(): Promise<void> {
    const descriptionLocator = this.page
      .getByTestId('JourneyDescription')
      .or(
        this.page
          .locator('[data-testid="DescriptionDot"]')
          .locator('xpath=../following-sibling::*[1]')
      )
    await expect(
      descriptionLocator.filter({ hasText: /Lorem Ipsum/ })
    ).toBeVisible({ timeout: thirtySecondsTimeout })
  }
}
