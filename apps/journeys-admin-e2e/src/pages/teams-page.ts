/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import dayjs from 'dayjs'
import type { Page } from 'playwright-core'

import testData from '../utils/testData.json'

let randomNumber = ''
const thirtySecondsTimeout = 30000

export class TeamsPage {
  readonly page: Page
  constructor(page: Page) {
    this.page = page
    randomNumber =
      dayjs().format('DDMMYY-hhmmss') +
      Math.floor(Math.random() * (100 - 999 + 1) + 999)
  }

  teamName = ''
  renameTeamName = ''
  memberEmail = ''

  async createNewTeamAndVerifyCreatedTeam() {
    await this.clickThreeDotOfTeams()
    await this.clickThreeDotOptions('New Team')
    await this.enterTeamName()
    await this.clickCreateBtn()
    await this.verifyTeamCreatedSnackbarMsg()
    await this.clickDiaLogBoxCloseBtn()
    await this.selectCreatedNewTeam()
    await this.verifyTeamNameUpdatedInTeamSelectDropdown()
  }

  async verifyCreatedTeamRenamed() {
    await this.clickThreeDotOfTeams()
    await this.clickThreeDotOptions('Rename')
    await this.enterTeamRename()
    await this.clickSaveBtn()
    await this.verifyTeamRenameSnackbarMsg()
    await this.verifyRenamedTeamNameUpdatedInTeamSelectDropdown()
  }

  async verifyMemberAddedViaMemberOptionOfThreeDotOptions() {
    await this.clickThreeDotOfTeams()
    await this.clickThreeDotOptions('Members')
    await this.verifyMemberAdded()
  }

  async verifyMemberAdded() {
    await this.enterTeamMember()
    await this.clickPlusMemberInMemberPopup()
    await this.verifyMemberAddedInMemberList()
    await this.clickDiaLogBoxCloseBtn()
  }

  async verifyMemberAddedViaPlusIconAtTopOfTheRightCorner() {
    await this.clickMemberPlusIcon()
    await this.verifyMemberAdded()
  }

  async clickThreeDotOfTeams() {
    const moreButton = this.page
      .getByTestId('MainPanelHeader')
      .locator('button')
      .filter({ has: this.page.locator('[data-testid="MoreIcon"]') })
    await expect(moreButton).toHaveCount(1)
    await expect(moreButton).toBeVisible()
    await moreButton.click()
  }

  async clickThreeDotOptions(options) {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItem"] span', {
        hasText: options
      })
      .click()
  }

  async enterTeamName() {
    this.teamName = testData.teams.teamName + randomNumber
    await this.page.locator('input#title').fill(this.teamName)
  }

  async clickCreateBtn() {
    await this.page
      .locator('div[data-testid="dialog-action"] button', { hasText: 'Create' })
      .click()
  }

  async verifyTeamCreatedSnackbarMsg() {
    await expect(
      this.page.locator('div#notistack-snackbar', {
        hasText: this.teamName + ' created.'
      })
    ).toBeVisible()
    await expect(this.page.locator('div#notistack-snackbar')).toHaveCount(0, {
      timeout: thirtySecondsTimeout
    })
  }

  async clickDiaLogBoxCloseBtn() {
    await this.page.locator('button[data-testid="dialog-close-button"]').click()
  }

  /** Team selector dropdown in header - scoped to avoid strict mode (multiple listboxes on page). */
  private getTeamSelectDropdown() {
    return this.page
      .getByTestId('TeamSelect')
      .locator('div[aria-haspopup="listbox"]')
  }

  /** Close dialogs/menus so TeamSelect clicks are not intercepted by MUI backdrops. */
  async dismissOpenOverlays(): Promise<void> {
    const backdrop = this.page.locator('.MuiModal-backdrop').first()
    if (await backdrop.isVisible({ timeout: 500 }).catch(() => false)) {
      await this.page.keyboard.press('Escape')
      await backdrop.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
    }
    const openListbox = this.page.locator('ul[role="listbox"]')
    if (await openListbox.first().isVisible({ timeout: 500 }).catch(() => false)) {
      await this.page.keyboard.press('Escape')
      await openListbox
        .first()
        .waitFor({ state: 'hidden', timeout: 5000 })
        .catch(() => {})
    }
  }

  async clickTeamSelectionDropDown(): Promise<void> {
    await this.dismissOpenOverlays()
    const dropdown = this.getTeamSelectDropdown()
    await expect(dropdown).toHaveCount(1)
    await expect(dropdown).toBeVisible()
    if ((await dropdown.getAttribute('aria-expanded')) === 'true') {
      await expect(this.page.locator('ul[role="listbox"]').first()).toBeVisible({
        timeout: thirtySecondsTimeout
      })
      return
    }
    await dropdown.click()
    await expect(this.page.locator('ul[role="listbox"]').first()).toBeVisible({
      timeout: thirtySecondsTimeout
    })
  }

  async selectLastTeam() {
    await this.page
      .locator('ul[role="listbox"] li[role="option"]', {
        hasNotText: 'Shared With Me'
      })
      .last()
      .click()
  }

  async selectCreatedNewTeam() {
    await this.selectTeamFromDropdown(this.teamName)
  }

  async selectTeamFromDropdown(teamName: string): Promise<void> {
    await this.clickTeamSelectionDropDown()
    const teamOption = this.page.locator('ul[role="listbox"] li[role="option"]', {
      hasText: teamName
    })
    await expect(teamOption.first()).toBeVisible({ timeout: thirtySecondsTimeout })
    await teamOption.first().click()
    await expect(this.page.locator('ul[role="listbox"]').first()).toBeHidden({
      timeout: thirtySecondsTimeout
    })
    await expect(this.getTeamSelectDropdown()).toHaveText(teamName, {
      timeout: thirtySecondsTimeout
    })
  }

  async verifyTeamNameUpdatedInTeamSelectDropdown() {
    await expect(this.getTeamSelectDropdown()).toHaveText(this.teamName)
  }

  async clickCreateJourneyBtn() {
    await this.page.locator('button[data-testid="AddJourneyButton"]').click()
  }

  async enterTeamRename() {
    this.renameTeamName = testData.teams.teamRename + randomNumber
    await this.page.locator('input#title').clear()
    await this.page.locator('input#title').fill(this.renameTeamName)
  }

  async clickSaveBtn() {
    await this.page
      .locator('div[data-testid="dialog-action"] button', { hasText: 'Save' })
      .click()
  }

  async verifyTeamRenameSnackbarMsg() {
    await expect(this.page.locator('div#notistack-snackbar')).toContainText(
      this.renameTeamName + ' updated.'
    )
    await expect(this.page.locator('div#notistack-snackbar')).toHaveCount(0, {
      timeout: thirtySecondsTimeout
    })
  }

  async verifyRenamedTeamNameUpdatedInTeamSelectDropdown() {
    await expect(this.getTeamSelectDropdown()).toHaveText(this.renameTeamName, {
      timeout: 60000
    })
  }

  async enterTeamMember() {
    this.memberEmail = 'playwright' + randomNumber + '@example.com'
    const emailInput = this.page.locator('input[name="email"]')
    await expect(emailInput).toBeEnabled({ timeout: thirtySecondsTimeout })
    await emailInput.fill(this.memberEmail)
  }

  async clickPlusMemberInMemberPopup() {
    await this.page.locator('button[aria-label="add user"]').click()
  }

  async verifyMemberAddedInMemberList() {
    await expect(
      this.page.locator('div[data-testid*="UserTeamInviteListItem"] p', {
        hasText: this.memberEmail
      })
    ).toBeVisible()
  }

  async clickMemberPlusIcon() {
    await this.page
      .locator('div[data-testid="member-dialog-open-avatar"]')
      .click()
  }

  //Custom Domain option in Three dot menu

  async enterCustomDomainName(domainName: string): Promise<void> {
    const domainInput = this.page.locator('div.MuiDialogContent-root input#name')
    await expect(domainInput).toBeVisible({ timeout: thirtySecondsTimeout })

    if (await domainInput.getAttribute('readonly')) {
      const disconnectButton = this.page
        .locator('div.MuiDialogContent-root')
        .getByRole('button', { name: 'Disconnect' })
      await expect(disconnectButton).toBeEnabled({ timeout: thirtySecondsTimeout })
      await disconnectButton.click()
      await expect(domainInput).toBeEditable({ timeout: thirtySecondsTimeout })
    }

    await domainInput.fill(domainName)
  }

  async clickConnectBtn() {
    await this.page
      .locator('div.MuiDialogContent-root')
      .getByRole('button', { name: 'Connect' })
      .click()
  }
  async searchJourneyNameAndChooseFirstSuggestion(journeyNamePartial: string) {
    await this.page
      .locator('div.MuiDialogContent-root input#defaultJourney')
      .pressSequentially(journeyNamePartial)
    await this.page
      .locator('ul#defaultJourney-listbox')
      .getByRole('option', { name: journeyNamePartial })
      .first()
      .click()
  }
  async getDnsContentAndCopy() {
    const copyIconPath = this.page.getByRole('button', { name: 'Copy' })
    await copyIconPath.click()
    return await this.page
      .locator('div.MuiStack-root table td', { has: copyIconPath })
      .innerText()
  }
  async clickCustomDomainDialogCloseIcon() {
    await this.page.locator('button[data-testid="dialog-close-button"]').click()
  }

  async clickAddIntegrationButton() {
    const addButton = this.page.getByTestId('Add-IntegrationsButton')
    await expect(addButton).toBeVisible({ timeout: 15000 })
    await addButton.click()
  }

  async clickGrowthSpaceIntegration() {
    await this.page.waitForURL(/\/integrations\/new/, { timeout: 20000 })
    const growthSpaceLink = this.page
      .getByRole('link', { name: /Growth Spaces/i })
      .or(this.page.getByTestId('growthSpaces-IntegrationsButton'))
    await expect(growthSpaceLink.first()).toBeVisible({ timeout: 25000 })
    await growthSpaceLink.first().click()
  }
  async enterAccessId(accessId: string) {
    await this.page
      .locator('p.MuiTypography-root:text-is("Access ID") ~ div input')
      .fill(accessId)
  }
  async enterAccessSecret(accessSecret: string) {
    await this.page
      .locator('p.MuiTypography-root:text-is("Access Secret") ~ div input')
      .fill(accessSecret)
  }
  async clickSaveBtnForintegration() {
    //invalid credentials for Growth Spaces integration
    await this.page.getByRole('button', { name: 'Save' }).click()
  }
}
