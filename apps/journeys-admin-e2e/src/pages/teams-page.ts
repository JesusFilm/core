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
    await this.clickTeamSelectionDropDown()
    // await this.selectLastTeam() // due to bug
    // await this.clickTeamSelectionDropDown()
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
    await this.page.getByTestId('MainPanelHeader').locator('button').click()
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

  async clickTeamSelectionDropDown() {
    await this.page.locator('div[aria-haspopup="listbox"]').click()
  }

  async selectLastTeam() {
    await this.page
      .locator('ul[role="listbox"] li[role="option"]', {
        hasNotText: t('Shared With Me')
      })
      .last()
      .click()
  }

  async selectCreatedNewTeam() {
    await this.page
      .locator('ul[role="listbox"] li[role="option"]', {
        hasText: this.teamName
      })
      .click()
  }

  async verifyTeamNameUpdatedInTeamSelectDropdown() {
    await expect(this.page.locator('div[aria-haspopup="listbox"]')).toHaveText(
      this.teamName
    )
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
    await expect(this.page.locator('div[aria-haspopup="listbox"]')).toHaveText(
      this.renameTeamName,
      { timeout: 60000 }
    )
  }

  async enterTeamMember() {
    this.memberEmail = 'playwright' + randomNumber + '@example.com'
    await this.page.locator('input[name="email"]').fill(this.memberEmail)
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

  async enterCustomDomainName(domainName) {
    await this.page
      .locator('div.MuiDialogContent-root input#name')
      .fill(domainName)
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
    await this.page.getByTestId('Add-IntegrationsButton').click()
  }
  async clickGrowthSpaceIntegration() {
    await this.page.getByTestId('growthSpaces-IntegrationsButton').click()
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
