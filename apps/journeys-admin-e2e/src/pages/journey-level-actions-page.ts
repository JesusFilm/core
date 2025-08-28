/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import type { Page } from 'playwright-core'

import { generateRandomNumber } from '../framework/helpers'
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
    this.memberEmail = `playwright${randomNumber}@example.com`
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
    await expect(
      this.page.locator(this.journeyNamePath, {
        hasText: this.renameJourneyName
      })
    ).toBeVisible({ timeout: thirtySecondsTimeout })
    await expect(
      this.page.locator(this.journeyNamePath, {
        hasText: this.existingJourneyName
      })
    ).toBeHidden({ timeout: thirtySecondsTimeout })
  }

  async enterTeamMember(): Promise<void> {
    await this.page.locator('input[name="email"]').fill(this.memberEmail)
  }

  async clickPlusMemberInMemberPopup(): Promise<void> {
    await this.page.locator('button[aria-label="add user"]').click()
  }

  async verifyAccessAddedInManageEditors(): Promise<void> {
    await expect(
      this.page.locator('div[data-testid="UserListItem"] p', {
        hasText: this.memberEmail
      })
    ).toBeVisible({ timeout: 20000 })
  }

  async clickDiaLogBoxCloseBtn(): Promise<void> {
    await this.page.locator('button[data-testid="dialog-close-button"]').click()
  }

  async verifyPreviewForExistingJourney(): Promise<void> {
    const [newPage] = await Promise.all([
      this.context.waitForEvent('page'),
      this.page
        .locator('ul[aria-labelledby="journey-actions"] a', {
          hasText: 'Preview'
        })
        .click()
    ])
    await newPage.waitForLoadState()
    await expect(
      newPage.locator('[data-testid="JourneysTypography"]')
    ).toContainText(this.existingJourneyName, { timeout: 15000 })
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
    await this.page
      .locator('div[role="dialog"] div[aria-haspopup="listbox"]')
      .click()
  }

  async selectTeamToCopyTheJourney(): Promise<void> {
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
    await expect(this.page.locator('div[aria-haspopup="listbox"]')).toHaveText(
      this.selectedTeam
    )
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
    await this.page
      .locator('ul[aria-labelledby="edit-journey-actions"] li', {
        hasText: option
      })
      .click({ delay: 2000, timeout: thirtySecondsTimeout })
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
        .click({ delay: 2000, timeout: thirtySecondsTimeout })
    }
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
    const selectedValue = await this.page
      .locator('input[placeholder="Search Language"]')
      .getAttribute('value', { timeout: thirtySecondsTimeout })
    this.selectedLanguage = selectedValue === language ? 'Malayalam' : language
    await this.page.locator('input[placeholder="Search Language"]').click()
    await expect(this.page.locator('span[role="progressbar"]')).toBeHidden({
      timeout: thirtySecondsTimeout
    })
    for (let scroll = 0; scroll < 300; scroll++) {
      const lang = await this.page
        .locator("div[class *='MuiAutocomplete-popper'] li p")
        .allTextContents()
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
        .waitFor({ state: 'attached' })
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await this.page.waitForTimeout(600)
      await expect(
        this.page.locator("div[class *='MuiAutocomplete-popper'] li").last()
      ).toBeAttached()
      await this.page
        .locator("div[class *='MuiAutocomplete-popper'] li")
        .last()
        .scrollIntoViewIfNeeded({ timeout: 30000 })
      await expect(
        this.page.locator("div[class *='MuiAutocomplete-popper'] li p")
      ).not.toHaveText(lang)
    }
    await this.page
      .locator("div[class *='MuiAutocomplete-popper'] li", {
        hasText: this.selectedLanguage
      })
      .first()
      .click({ timeout: thirtySecondsTimeout })
  }

  async verifyLinkIsCopied() {
    const clipBoardText = await this.page.evaluate(
      'navigator.clipboard.readText()'
    )
    const copiedLinkPage = await this.context.newPage()
    await copiedLinkPage.goto(clipBoardText)
    await expect(
      copiedLinkPage.locator('[data-testid="JourneysTypography"]')
    ).toContainText(this.existingJourneyName, { timeout: 15000 })
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
    ).toHaveAttribute('value', this.selectedLanguage)
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

  async validateJourneyDescription() {
    await expect(
      this.page.locator('p[data-testid="DescriptionDot"] + p', {
        hasText: this.descriptionText
      })
    ).toBeVisible()
  }
}
