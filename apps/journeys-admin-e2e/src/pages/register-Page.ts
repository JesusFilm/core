/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import dayjs from 'dayjs'
import type { Page } from 'playwright-core'

import { getOTP, getPassword } from '../framework/helpers'
import testData from '../utils/testData.json'

const thirtySecondsTimeout = 30000
export class Register {
  readonly page: Page
  name: string
  userEmail: string
  private readonly randomNumber: string
  constructor(page: Page) {
    this.page = page
    // Use 24-hour clock (HHmmss) + 6 random digits for sufficient uniqueness.
    // Module-level state caused email collisions across parallel workers.
    this.randomNumber =
      dayjs().format('DDMMYYHHmmss') +
      Math.floor(Math.random() * 900000 + 100000)
  }

  /** Same value as {@link enterName} — used as `displayName` when creating the first team on Terms. */
  getRegisteredDisplayName(): string {
    return testData.register.userName + this.randomNumber
  }

  async registerNewAccount() {
    try {
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
      // After OTP validation verify.tsx always navigates to /terms-and-conditions
      // (handleReValidateEmail:96-99). acceptTermsAndContinue asserts the URL first.
      await this.acceptTermsAndContinue()
      await this.verifyTermsAcceptedAndPersisted()
      await this.waitUntilTheToestMsgDisappear()
    } catch (error) {
      const onboardingHeading = await this.getCurrentOnboardingHeading()
      throw new Error(
        `registerNewAccount failed (url: ${this.page.url()}, heading: ${onboardingHeading ?? 'none'}): ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Same as {@link registerNewAccount} through email verification, then stops on
   * Terms and Conditions without accepting — for resume / return-sign-in flows.
   */
  async registerNewAccountThroughOtpThenStopOnTermsPage() {
    try {
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
      await this.assertOnTermsAndConditionsPage()
    } catch (error) {
      const onboardingHeading = await this.getCurrentOnboardingHeading()
      throw new Error(
        `registerNewAccountThroughOtpThenStopOnTermsPage failed (url: ${this.page.url()}, heading: ${onboardingHeading ?? 'none'}): ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async enterUserName() {
    this.userEmail = `playwright${this.randomNumber}@example.com`
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
      .fill(testData.register.userName + this.randomNumber)
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
      // 90s: cold Vercel SSR on the daily-e2e environment can take >30s to
      // render the verify page on the first request after a new registration.
    ).toBeVisible({ timeout: 90000 })
  }

  /** Only act on verify-email UI after we know we are on that step. */
  async assertOnVerifyEmailPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/users\/verify/)
    await this.verifyPageNavigatedToVerifyYourEmailPage()
  }

  async enterOTP(otp: string) {
    await this.assertOnVerifyEmailPage()

    const verifyForm = this.page.locator('form[data-testid="EmailInviteForm"]')
    const accordionToggle = verifyForm.getByRole('button', {
      name: /Verify With Code Instead/i
    })
    await expect(accordionToggle).toBeVisible({
      timeout: thirtySecondsTimeout
    })

    const tokenInput = verifyForm.locator('input[name="token"]')

    // Assert the user-visible outcome (code field usable), not only aria-expanded:
    // MUI accordion can lag or miss a single click; retrying the toggle is a user-realistic recovery.
    await expect(async () => {
      await accordionToggle.click()
      await expect(tokenInput).toBeVisible({ timeout: 5000 })
    }).toPass({ timeout: thirtySecondsTimeout })

    await expect(tokenInput).toBeEnabled({ timeout: thirtySecondsTimeout })
    await tokenInput.fill(otp)
  }

  async clickValidateEmailBtn() {
    await this.assertOnVerifyEmailPage()
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
    ).toBeVisible({ timeout: 90000 })
  }

  /** Terms onboarding route + visible title before any clicks on that screen. */
  async assertOnTermsAndConditionsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/terms-and-conditions/, {
      timeout: 90000
    })
    await this.verifyPageNavigatedBeforeStartPage()
  }

  /** Workspace step URL + heading before filling the form. */
  async assertOnCreateYourWorkspacePage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/teams\/new/)
    await this.verifyCreateYourWorkspacePage()
  }

  async completeCreateYourWorkspaceStep() {
    await this.assertOnCreateYourWorkspacePage()
    await this.entetTeamName()
    await this.clickCreateBtn()
    await this.assertOnTermsAndConditionsPage()
  }

  async verifyTermsAcceptedAndPersisted() {
    // Wait for navigation away from Terms before checking the Discover page.
    await this.page.waitForURL(
      (url) => !url.toString().includes('terms-and-conditions'),
      { timeout: 120000 }
    )
    await this.waitUntilDiscoverPageLoaded()
    await this.page.reload({ waitUntil: 'domcontentloaded' })
    await expect(this.page).not.toHaveURL(/terms-and-conditions/, {
      timeout: thirtySecondsTimeout
    })
  }

  /**
   * Terms step: confirm URL + screen, then click the agreement row (MUI ListItemButton),
   * assert the native checkbox is checked, then Next becomes enabled.
   */
  async acceptTermsAndContinue() {
    await this.assertOnTermsAndConditionsPage()

    const termsRoot = this.page
      .locator('div[data-testid="JourneysAdminOnboardingPageWrapper"]')
      .filter({ hasText: 'Terms and Conditions' })
    await expect(termsRoot).toBeVisible({ timeout: 90000 })

    const agreeRow = termsRoot.getByRole('button', {
      name: /I agree with listed above conditions and requirements/i
    })
    await expect(agreeRow).toBeVisible({ timeout: thirtySecondsTimeout })
    await agreeRow.scrollIntoViewIfNeeded()

    const agreeInput = termsRoot.locator(
      'input[aria-labelledby="i-agree-label"]'
    )
    await expect(async () => {
      await agreeRow.click()
      await expect(agreeInput).toBeChecked({ timeout: 5000 })
    }).toPass({ timeout: thirtySecondsTimeout })

    const nextButton = termsRoot.locator(
      'button[data-testid="TermsAndConditionsNextButton"]'
    )
    await expect(nextButton).toBeVisible({ timeout: thirtySecondsTimeout })
    await expect(nextButton).toBeEnabled({ timeout: thirtySecondsTimeout })
    await nextButton.click()
  }

  async clickIAgreeBtn() {
    await this.assertOnTermsAndConditionsPage()

    const termsRoot = this.page
      .locator('div[data-testid="JourneysAdminOnboardingPageWrapper"]')
      .filter({ hasText: 'Terms and Conditions' })
    const agreeRow = termsRoot.getByRole('button', {
      name: /I agree with listed above conditions and requirements/i
    })
    await expect(agreeRow).toBeVisible({ timeout: thirtySecondsTimeout })
    await agreeRow.scrollIntoViewIfNeeded()
    const agreeInput = termsRoot.locator(
      'input[aria-labelledby="i-agree-label"]'
    )
    await expect(async () => {
      await agreeRow.click()
      await expect(agreeInput).toBeChecked({ timeout: 5000 })
    }).toPass({ timeout: thirtySecondsTimeout })
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
    await this.assertOnCreateYourWorkspacePage()
    await this.page
      .locator('input#title')
      .fill(testData.teams.teamName + this.randomNumber, { timeout: 60000 })
  }

  async clickCreateBtn() {
    await this.assertOnCreateYourWorkspacePage()
    const createButton = this.page.locator('button[type="button"]', {
      hasText: 'Create'
    })
    await expect(createButton).toBeVisible({ timeout: thirtySecondsTimeout })
    await expect(createButton).toBeEnabled({ timeout: thirtySecondsTimeout })
    await createButton.click()
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
    // 90s: cold Vercel SSR + TeamProvider Apollo query can take >70s on first run
    await expect(
      this.page.getByRole('button', { name: 'Create Custom Journey' })
    ).toBeEnabled({ timeout: 90000 })
  }

  async waitUntilTheToestMsgDisappear() {
    await expect(this.page.locator('div#notistack-snackbar')).toHaveCount(0, {
      timeout: 30000
    })
  }

  async verifyMoreJourneyHerePopup() {
    // waiting for 'More journeys here' appear if it is don't, we doesn't need to assert the script
    const moreJourneysLocator = this.page.locator(
      'div[class*="MuiPopover-paper"] h6',
      {
        hasText: 'More journeys here'
      }
    )

    try {
      await expect(moreJourneysLocator).toBeVisible({ timeout: 5000 })
      const dismissButtonLocator = this.page.locator(
        'div[class*="MuiPopover-paper"] button',
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

  async getCurrentOnboardingHeading(): Promise<string | null> {
    const heading = this.page
      .locator(
        'div[data-testid="JourneysAdminOnboardingPageWrapper"] h1, div[data-testid="JourneysAdminOnboardingPageWrapper"] h2, div[data-testid="JourneysAdminOnboardingPageWrapper"] h6'
      )
      .first()
    if (!(await heading.isVisible().catch(() => false))) return null
    const text = await heading.textContent()
    return text?.trim() || null
  }

  async clickNextBtnOfTermsAndConditions() {
    await this.assertOnTermsAndConditionsPage()

    const termsRoot = this.page
      .locator('div[data-testid="JourneysAdminOnboardingPageWrapper"]')
      .filter({ hasText: 'Terms and Conditions' })
    const nextButton = termsRoot.locator(
      'button[data-testid="TermsAndConditionsNextButton"]'
    )
    await expect(nextButton).toBeVisible({ timeout: thirtySecondsTimeout })
    await expect(nextButton).toBeEnabled({ timeout: thirtySecondsTimeout })
    await nextButton.click()
  }

  async verifyCreateYourWorkspacePage() {
    // 90s: post-validate navigation can be slow on cold Vercel / SSR.
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminOnboardingPageWrapper"] h2',
        { hasText: 'Create Your Workspace' }
      )
    ).toBeVisible({ timeout: 90000 })
  }
}
