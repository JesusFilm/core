import { expect } from '@playwright/test'
import dayjs from 'dayjs'
import type { Page } from 'playwright-core'

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
  constructor(page: Page) {
    this.page = page
    randomNumber =
      dayjs().format('DDMMYY-hhmmss') +
      Math.floor(Math.random() * (100 - 999 + 1) + 999)
    this.memberEmail = `playwright${randomNumber}@example.com`
  }

  async setBrowserContext(context) {
    this.context = context
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

  async clickThreeDotOfCreatedJourney(journeyName) {
    await this.page
      .locator('div[aria-label="journey-card"]', { hasText: journeyName })
      .first()
      .locator('button#journey-actions')
      .first()
      .click()
    this.existingJourneyName = journeyName
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

  async selectCreatedJourney(journeyName) {
    this.existingJourneyName = journeyName
    await this.page
      .locator('div[aria-label="journey-card"]', { hasText: journeyName })
      .first()
      .click()
  }

  async clickThreeDotOptions(options) {
    await this.page
      .locator('ul[aria-labelledby="journey-actions"] li', { hasText: options })
      .click()
  }

  async enterTitle() {
    this.renameJourneyName = testData.journey.renameJourneyName + randomNumber
    await this.page
      .locator('input#title')
      .click({ delay: 2000, timeout: 30000 })
    await this.page.locator('input#title').clear()
    await this.page.locator('input#title').fill(this.renameJourneyName)
  }

  async verifyJourneyRenamedInActiveList() {
    await expect(
      this.page.locator('span[data-testid="new-journey-badge"] div').first()
    ).toBeVisible({ timeout: 300000 })
    await expect(
      this.page.locator('span[data-testid="new-journey-badge"] div', {
        hasText: this.renameJourneyName
      })
    ).toBeVisible()
    await expect(
      this.page.locator('span[data-testid="new-journey-badge"] div', {
        hasText: this.existingJourneyName
      })
    ).toBeHidden({ timeout: 30000 })
  }

  async enterTeamMember() {
    await this.page.locator('input[name="email"]').fill(this.memberEmail)
  }

  async clickPlusMemberInMemberPopup() {
    await this.page.locator('button[aria-label="add user"]').click()
  }

  async verifyAccessAddedInManageEditors() {
    await expect(
      this.page.locator('div[data-testid="UserListItem"] p', {
        hasText: this.memberEmail
      })
    ).toBeVisible({ timeout: 20000 })
  }

  async clickDiaLogBoxCloseBtn() {
    await this.page.locator('button[data-testid="dialog-close-button"]').click()
  }

  async verifyPreviewForExistingJourney() {
    const [newPage] = await Promise.all([
      this.context.waitForEvent('page'),
      this.page
        .locator('ul[aria-labelledby="journey-actions"] a', {
          hasText: 'Preview'
        })
        .click()
    ])
    await newPage.waitForLoadState()
    // await expect(await newPage.locator('h3[data-testid="JourneysTypography"]')).toHaveText(this.existingJourneyName)
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

  async verifyExistingJourneyDuplicate() {
    await expect(
      this.page.locator('span[data-testid="new-journey-badge"] div', {
        hasText: `${this.existingJourneyName} copy`
      })
    ).toBeVisible()
  }

  async verifySnackBarMsg(snackbarMsg: string) {
    await expect(
      this.page.locator('div[id="notistack-snackbar"]', {
        hasText: snackbarMsg
      })
    ).toBeVisible({ timeout: 30000 })
    await expect(
      this.page.locator('div[id="notistack-snackbar"]', {
        hasText: snackbarMsg
      })
    ).toBeHidden({ timeout: 30000 })
  }

  async clickSelectTeamDropDownIcon() {
    await this.page
      .locator('div[role="dialog"] div[aria-haspopup="listbox"]')
      .click()
  }

  async selectTeamToCopyTheJourney() {
    this.selectedTeam = await this.page
      .locator('div[id="menu-teamSelect"] ul[role="listbox"] li')
      .last()
      .getAttribute('aria-label')
    await this.page
      .locator('div[id="menu-teamSelect"] ul[role="listbox"] li')
      .last()
      .click()
    await expect(
      this.page
        .locator('div[id="menu-teamSelect"] ul[role="listbox"] li')
        .first()
    ).toBeHidden({ timeout: 30000 })
  }

  async clickCopyButton() {
    await this.page
      .locator('div[data-testid="dialog-action"] button[type="button"]', {
        hasText: 'Copy'
      })
      .click()
  }

  async verifyCopiedTeamNameUpdatedInTeamSelectDropdown() {
    await expect(this.page.locator('div[aria-haspopup="listbox"]')).toHaveText(
      this.selectedTeam
    )
  }

  async verifyCopiedJournetInSelectedTeamList() {
    await expect(
      this.page
        .locator('span[data-testid="new-journey-badge"] div', {
          hasText: this.existingJourneyName
        })
        .first()
    ).toBeVisible()
  }

  async clickThreeDotOptionsOfJourneyCreationPage(option) {
    await this.page
      .locator('ul[aria-labelledby="edit-journey-actions"] li', {
        hasText: option
      })
      .click({ delay: 2000, timeout: 30000 })
    // After selecting the option from the list, check that the menu items list got closed, if not then again select the same option from the menu items in catch block
    try {
      await expect(
        this.page.locator(
          'div[id=edit-journey-actions][aria-hidden="true"] ul[aria-labelledby="edit-journey-actions"] li'
        )
      ).not.toHaveCount(0)
    } catch {
      await this.page
        .locator('ul[aria-labelledby="edit-journey-actions"] li', {
          hasText: option
        })
        .click({ delay: 2000, timeout: 30000 })
    }
  }

  async enterDescription() {
    await this.page.locator('textarea#description').clear({ timeout: 50000 })
    await this.page.locator('textarea#description').fill(this.descriptionText)
  }

  async verifyDescriptionAddedForSelectedJourney() {
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

  async enterLanguage(language: string) {
    const selectedValue = await this.page
      .locator('input[placeholder="Search Language"]')
      .getAttribute('value', { timeout: 30000 })
    this.selectedLanguage = selectedValue === language ? 'Malayalam' : language
    await this.page.locator('input[placeholder="Search Language"]').click()
    await expect(this.page.locator('span[role="progressbar"]')).toBeHidden({
      timeout: 30000
    })
    for (let scroll = 0; scroll < 300; scroll++) {
      if (
        await this.page
          .locator("div[class *='MuiAutocomplete-popper'] li", {
            hasText: this.selectedLanguage
          })
          .first()
          .isVisible()
      ) {
        break
      }
      expect(scroll !== 299).toBeTruthy()
      await this.page
        .locator("div[class *='MuiAutocomplete-popper'] li")
        .last()
        .waitFor({ state: 'visible' })
      await this.page
        .locator("div[class *='MuiAutocomplete-popper'] li")
        .last()
        .scrollIntoViewIfNeeded()
    }
    await this.page
      .locator("div[class *='MuiAutocomplete-popper'] li", {
        hasText: this.selectedLanguage
      })
      .first()
      .click({ timeout: 30000 })
  }

  async verifyLinkIsCopied() {
    const copiedLinkPage = await this.context.newPage()
    const clipBoardText = await this.page.evaluate(
      'navigator.clipboard.readText()'
    )
    await copiedLinkPage.goto(clipBoardText)
    const tabName: string = await copiedLinkPage.title()
    expect(tabName.includes(this.existingJourneyName)).toBeTruthy()
  }

  async clickNavigateToGoalBtn() {
    await this.page.locator('div[data-testid="StrategyItem"] button').click()
  }

  async verifyPageIsNavigatedToGoalPage() {
    await expect(
      this.page.locator('div[data-testid="ActionInformation"] h6', {
        hasText: 'What are Goals?'
      })
    ).toBeVisible()
    // let currentUrl = await this.page.url()
    // expect( currentUrl.includes('param=goals')).toBeTruthy() // now the uRL doesn't change after clicking goal(Strategy) btn
  }

  async clickNavigationSideMenu() {
    await this.page
      .locator('div[data-testid="NavigationListItemToggle"]')
      .click()
  }

  async verifyNavigationSideMenuOpened() {
    await expect(
      this.page.locator(
        'div[data-testid="NavigationDrawer"] div[aria-hidden="true"][style*="visibility: hidden"]'
      )
    ).toBeHidden()
  }

  async verifyNavigationSideMenuClosed() {
    await expect(
      this.page.locator(
        'div[data-testid="NavigationDrawer"] div[aria-hidden="true"][style*="visibility: hidden"]'
      )
    ).toHaveCount(1)
  }

  async clickHelpBtn() {
    await expect(
      this.page.getByTestId('side-header').locator('button[aria-label="Help"]')
    ).toBeEnabled({ timeout: 30000 })
    await this.page
      .getByTestId('side-header')
      .locator('button[aria-label="Help"]')
      .click({ delay: 3000 })
  }

  async verifyHelpWindowOpened() {
    await expect(
      this.page.locator(
        'div[class="Beacon"] div[class*="BeaconContainer-enter-done"]'
      )
    ).toBeVisible()
  }

  async verifySelectedLanguageInLanguagePopup() {
    await expect(
      this.page.locator('input[placeholder="Search Language"]')
    ).toHaveAttribute('value', this.selectedLanguage)
  }

  async sleep(ms: number) {
    // eslint-ignore-next-line
    return await new Promise((resolve) => setTimeout(resolve, ms))
  }
}
