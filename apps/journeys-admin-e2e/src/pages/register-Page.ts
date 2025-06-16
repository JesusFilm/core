/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import dayjs from 'dayjs'
import type { Page } from 'playwright-core'

import { getOTP, getPassword } from '../framework/helpers'
import testData from '../utils/testData.json'

let randomNumber = ''
const thirtySecondsTimeout = 30000
const seventySecondsTimeout = 70000

export class Register {
  readonly page: Page
  name: string
  userEmail: string
  constructor(page: Page) {
    this.page = page
    randomNumber =
      dayjs().format('DDMMYYhhmmss') +
      Math.floor(Math.random() * (100 - 999 + 1) + 999)
  }

  async registerNewAccount() {
    const otp = await getOTP()
    const password = await getPassword()
    await this.enterUserName()
    await this.clickSignInWithEmailBtn()
    await this.enterName()
    await this.enterPassword(password)
    await this.clickSignUpBtn()
    await this.verifyPageNavigatedToVerifyYourEmailPage()
    await this.enterOTP(otp)
    await this.clickValidateEmailBtn()
    await this.verifyPageNavigatedBeforeStartPage()
    await this.clickIAgreeBtn()
    await this.clickNextBtn()
    await this.waitUntilDiscoverPageLoaded()
    await this.waitUntilTheToestMsgDisappear()
  }

  async enterUserName() {
    this.userEmail = `playwright${randomNumber}@example.com`
    await this.page.locator('input#username').fill(this.userEmail)
  }

  async clickSignInWithEmailBtn() {
    await this.page
      .locator('form[data-testid="EmailSignInForm"] button[type="submit"]')
      .click()
  }

  async enterName() {
    await this.page
      .locator('input#name')
      .fill(testData.register.userName + randomNumber)
  }

  async enterPassword(password: string) {
    await this.page.locator('input#new-password').fill(password)
  }

  async clickSignUpBtn() {
    await this.page
      .locator('form[data-testid="RegisterForm"] button', {
        hasText: 'Sign Up'
      })
      .click()
  }

  async verifyPageNavigatedToVerifyYourEmailPage() {
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminOnboardingPageWrapper"]',
        { hasText: 'Verify Your Email' }
      )
    ).toBeVisible({ timeout: 30000 })
  }

  async enterOTP(otp) {
    await this.page
      .locator(
        'form[data-testid="EmailInviteForm"] >> text="Verify With Code Instead"'
      )
      .click()
    await expect(
      this.page.locator(
        'form[data-testid="EmailInviteForm"] [aria-expanded="true"]'
      )
    ).toBeVisible()
    await this.page.locator('div[role="region"]  input[name="token"]').fill(otp)
  }

  async clickValidateEmailBtn() {
    await this.page
      .locator('button[type="submit"]', { hasText: 'Validate Email' })
      .click()
  }

  async verifyPageNavigatedBeforeStartPage() {
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminOnboardingPageWrapper"]',
        { hasText: 'Terms and Conditions' }
      )
    ).toBeVisible({ timeout: 60000 })
  }

  async clickIAgreeBtn() {
    await this.page.locator('input[aria-labelledby="i-agree-label"]').check()
  }

  async clickNextBtn() {
    await this.page
      .locator('button[type="button"]', { hasText: 'Next' })
      .click({ delay: 2000 })
  }

  async verifyPageNavigatedFewQuestionsPage() {
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminOnboardingPageWrapper"]',
        { hasText: 'User Insights' }
      )
    ).toBeVisible({ timeout: 50000 })
  }

  async clickNextBtnInFewQuestionPage() {
    await this.page
      .locator('button[type="submit"]', { hasText: 'Next' })
      .click({ delay: 3000 })
  }

  async entetTeamName() {
    await this.page
      .locator('input#title')
      .fill(testData.teams.teamName + randomNumber, { timeout: 60000 })
  }

  async clickCreateBtn() {
    await this.page
      .locator('button[type="button"]', { hasText: 'Create' })
      .click()
  }

  async verifyPageNavigatedInviteTeammatesPage() {
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminOnboardingPageWrapper"] span',
        { hasText: 'Invite Teammates' }
      )
    ).toBeVisible({ timeout: 50000 })
  }

  async clickSkipBtn() {
    await this.page
      .locator('button[type="button"]', { hasText: 'Skip' })
      .click()
  }

  async waitUntilDiscoverPageLoaded() {
    try {
      await this.waitForNavigationItem()
      await this.waitForPageSelection()
      await this.waitForMainContent()
      await this.waitForSidePanel()
      await this.waitForTeamSelection()
      await this.handleSharedWithMeState()
    } catch (error) {
      console.error('Failed to load Discover page:', error.message)
      throw error
    }
  }

  private async waitForNavigationItem(): Promise<void> {
    const navigationSelectors = [
      '[data-testid="NavigationListItemDiscover"]',
      'a:has-text("Discover")',
      '[role="button"]:has-text("Discover")'
    ]

    const attempts = navigationSelectors.map((selector) =>
      expect(this.page.locator(selector)).toBeVisible({ timeout: 30000 })
    )

    try {
      await Promise.any(attempts)
    } catch (error) {
      throw new Error(
        `Navigation item not found. Attempted selectors: ${navigationSelectors.join(', ')}`
      )
    }
  }

  private async waitForPageSelection(): Promise<void> {
    const selectionSelectors = [
      '[data-testid="NavigationListItemDiscover"].Mui-selected',
      '[data-testid="NavigationListItemDiscover"][aria-current]',
      '[data-testid="NavigationListItemDiscover"][class*="selected"]'
    ]

    const attempts = selectionSelectors.map((selector) =>
      expect(this.page.locator(selector)).toBeVisible({ timeout: 15000 })
    )

    // Add URL check as a final attempt - matches root path (discover page)
    attempts.push(this.page.waitForURL(/^\/(\?.*)?$/, { timeout: 15000 }))

    try {
      await Promise.any(attempts)
    } catch (error) {
      throw new Error(
        `Page selection state not detected. Attempted selectors: ${selectionSelectors.join(', ')} and URL pattern`
      )
    }
  }

  private async waitForMainContent(): Promise<void> {
    const contentSelectors = [
      '[data-testid="JourneysAdminJourneyList"]',
      '[data-testid*="JourneyList"]',
      'main:has([data-testid*="Journey"])',
      '.MuiGrid-container',
      '[role="main"]'
    ]

    const attempts = contentSelectors.map((selector) =>
      expect(this.page.locator(selector)).toBeVisible({ timeout: 30000 })
    )

    try {
      await Promise.any(attempts)
    } catch (error) {
      throw new Error(
        `Main content not loaded. Attempted selectors: ${contentSelectors.join(', ')}`
      )
    }
  }

  private async waitForSidePanel(): Promise<void> {
    const sidePanelSelectors = [
      '[data-testid="side-panel"]',
      '[data-testid*="side"]',
      'aside',
      '.MuiDrawer-paper'
    ]

    const attempts = sidePanelSelectors.map((selector) =>
      expect(this.page.locator(selector)).toBeVisible({ timeout: 30000 })
    )

    try {
      await Promise.any(attempts)
    } catch (error) {
      // Side panel is optional, so we log but don't throw
      console.log(
        `Side panel not found. Attempted selectors: ${sidePanelSelectors.join(', ')}`
      )
    }
  }

  private async waitForTeamSelection(): Promise<void> {
    const teamSelectors = [
      '[data-testid="TeamSelect"]',
      '[data-testid*="Team"]',
      '[aria-label*="team"]',
      '[role="combobox"]:has-text("Team")'
    ]

    const attempts = teamSelectors.map((selector) =>
      expect(this.page.locator(selector)).toBeVisible({ timeout: 15000 })
    )

    try {
      await Promise.any(attempts)
    } catch (error) {
      // Team selection is optional, so we log but don't throw
      console.log(
        `Team selection not found. Attempted selectors: ${teamSelectors.join(', ')}`
      )
    }
  }

  private async handleSharedWithMeState(): Promise<void> {
    const teamSelectElement = this.page.locator('[data-testid="TeamSelect"]')

    if (await teamSelectElement.isVisible()) {
      const teamSelectText = await teamSelectElement.textContent()

      if (teamSelectText?.includes('Shared With Me')) {
        console.log(
          'User is in "Shared With Me" state, selecting first team...'
        )

        try {
          await teamSelectElement.click()

          // Try different selectors for the dropdown options
          const optionSelectors = [
            '[role="listbox"] [role="option"]',
            '.MuiMenuItem-root'
          ]

          let optionClicked = false
          for (const selector of optionSelectors) {
            try {
              await this.page.locator(selector).first().click()
              optionClicked = true
              break
            } catch {
              // Continue to next selector
            }
          }

          if (!optionClicked) {
            throw new Error('Could not find dropdown option to click')
          }

          await this.page.waitForTimeout(2000)
        } catch (error) {
          throw new Error(
            `Failed to handle "Shared With Me" state: ${error.message}`
          )
        }
      }
    }
  }

  async waitUntilTheToestMsgDisappear() {
    await expect(this.page.locator('div#notistack-snackbar')).toHaveCount(0, {
      timeout: 30000
    })
  }

  async verifyMoreJourneyHerePopup() {
    // waiting for 'More journeys here' appear if it is don't, we doesn't need to assert the script
    const moreJourneysLocator = this.page.locator(
      '[role="tooltip"], [role="dialog"]',
      {
        hasText: 'More journeys here'
      }
    )

    try {
      await expect(moreJourneysLocator).toBeVisible({ timeout: 5000 })
      const dismissButtonLocator = this.page.locator(
        '[role="tooltip"] button, [role="dialog"] button',
        {
          hasText: 'Dismiss'
        }
      )
      await dismissButtonLocator.click()
    } catch {
      console.log('More journeys here is not appear')
    }
  }

  async getUserEmailId() {
    return this.userEmail
  }

  async clickNextBtnOfTermsAndConditions() {
    await this.page
      .locator('button[data-testid="TermsAndConditionsNextButton"]')
      .click()
  }

  async retryCreateYourWorkSpacePage() {
    // clicking on 'Next' button twice if the Create Your Workspace page doesn't appears
    try {
      await expect(
        this.page.locator(
          'div[data-testid="JourneysAdminOnboardingPageWrapper"] h2',
          { hasText: 'Create Your Workspace' }
        )
      ).toBeVisible({ timeout: 10000 })
    } catch {
      await this.clickNextBtnOfTermsAndConditions()
    }
  }

  async verifyCreateYourWorkspacePage() {
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminOnboardingPageWrapper"] h2',
        { hasText: 'Create Your Workspace' }
      )
    ).toBeVisible({ timeout: 10000 })
  }
}
