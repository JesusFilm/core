/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import dayjs from 'dayjs'
import { Page } from 'playwright-core'

import { getOTP, getPassword } from '../framework/helpers'
import testData from '../utils/testData.json'

let randomNumber = ''
const thirtySecondsTimeout = 30000
const sixtySecondsTimeout = 60000

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
    await this.clickNextBtn()
    // disable while formium is broken
    // await this.verifyPageNavigatedFewQuestionsPage()
    // await this.clickNextBtnInFewQuestionPage()
    await this.entetTeamName()
    await this.clickCreateBtn()
    await this.waitUntilDiscoverPageLoaded()
    await this.waitUntilTheToestMsgDisappear()
  }

  async enterUserName() {
    this.userEmail = 'playwright' + randomNumber + '@example.com'
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
    ).toBeVisible({ timeout: thirtySecondsTimeout })
  }

  async enterOTP(otp) {
    await this.page
      .locator(
        'form[data-testid="EmailInviteForm"] div[class*="MuiAccordionSummary"]'
      )
      .first()
      .click()
    await expect(
      this.page
        .locator(
          'form[data-testid="EmailInviteForm"] div[class*="MuiAccordionSummary"]'
        )
        .first()
    ).toHaveAttribute('aria-expanded', 'true')
    await this.page
      .locator('div[role="region"]  input[name="token"]')
      .fill(otp as string)
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
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async clickIAgreeBtn() {
    await this.page.locator('input[aria-labelledby="i-agree-label"]').check()
  }

  async clickNextBtn() {
    await this.page
      .locator('button[data-testid="TermsAndConditionsNextButton"]')
      .click()
  }

  async entetTeamName() {
    await this.page
      .locator('input#title')
      .fill(testData.teams.teamName + randomNumber)
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
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async clickSkipBtn() {
    await this.page
      .locator('button[type="button"]', { hasText: 'Skip' })
      .click()
  }

  async waitUntilDiscoverPageLoaded() {
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminContainedIconButton"] button'
      )
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async waitUntilTheToestMsgDisappear() {
    await expect(this.page.locator('div#notistack-snackbar')).toHaveCount(0, {
      timeout: thirtySecondsTimeout
    })
  }

  async getUserEmailId() {
    return this.userEmail
  }
}
