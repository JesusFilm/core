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
    // First, wait for the discover navigation item to be visible
    await expect(
      this.page.locator('[data-testid="NavigationListItemDiscover"]')
    ).toBeVisible({ timeout: 30000 })

    // Wait for the discover page to be selected (either by class or by checking the URL)
    try {
      await expect(
        this.page.locator(
          '[data-testid="NavigationListItemDiscover"].Mui-selected'
        )
      ).toBeVisible({ timeout: 15000 })
    } catch {
      // If the class-based selector doesn't work, check the URL
      await expect(this.page).toHaveURL(/\/$/, { timeout: 15000 })
    }

    // Wait for the main content area to be loaded
    await expect(
      this.page.locator('[data-testid="JourneysAdminJourneyList"]')
    ).toBeVisible({ timeout: 30000 })

    // Wait for the side panel to be loaded
    await expect(this.page.locator('[data-testid="side-panel"]')).toBeVisible({
      timeout: 30000
    })

    // Wait for team to be loaded by checking if team select is visible
    try {
      await expect(this.page.locator('[data-testid="TeamSelect"]')).toBeVisible(
        { timeout: 15000 }
      )
    } catch {
      console.log('Team select not found, continuing...')
    }

    // Check if we're in "Shared With Me" state and need to select a team
    const isSharedWithMe = await this.page
      .locator('[data-testid="TeamSelect"]')
      .textContent()
    if (isSharedWithMe?.includes('Shared With Me')) {
      console.log('User is in "Shared With Me" state, selecting first team...')
      // Click on team select to open dropdown
      await this.page.locator('[data-testid="TeamSelect"]').click()
      // Wait for dropdown to open and select first team
      await this.page
        .locator('[role="listbox"] [role="option"]')
        .first()
        .click()
      // Wait a bit for the team to be selected
      await this.page.waitForTimeout(2000)
    }

    // Finally, wait for the create journey button to appear
    await expect(
      this.page.locator('[data-testid="JourneysAdminContainedIconButton"]')
    ).toBeVisible({ timeout: 30000 })

    // Add some debugging information
    try {
      const teamSelectText = await this.page
        .locator('[data-testid="TeamSelect"]')
        .textContent()
      console.log('Team select text:', teamSelectText)

      const buttonExists = await this.page
        .locator('[data-testid="JourneysAdminContainedIconButton"]')
        .isVisible()
      console.log('Create journey button visible:', buttonExists)
    } catch {
      console.log('Debug info gathering failed, but continuing...')
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
