/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { randomBytes } from 'crypto'

import { expect } from '@playwright/test'
import dayjs from 'dayjs'
import type { Page } from 'playwright-core'

import { getOTP, getPassword } from '../framework/helpers'
import testData from '../utils/testData.json'

let randomNumber = ''
const thirtySecondsTimeout = 30000
export class Register {
  readonly page: Page
  name: string
  userEmail: string
  activeTeamTitle = ''
  constructor(page: Page) {
    this.page = page
    randomNumber = `${dayjs().format('DDMMYYhhmmssSSS')}${randomBytes(8).toString('hex')}`
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
    await this.proceedAfterEmailVerification()
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
      .fill(testData.register.userName + randomNumber, {
        timeout: 60000
      })
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
    const summary = this.page
      .locator(
        'form[data-testid="EmailInviteForm"] [data-testid="VerifyCodeAccordionSummary"]'
      )
      .first()
    await summary.click()
    const tokenInput = this.page.locator(
      'div[role="region"] input[name="token"]'
    )
    // Prefer waiting for the token field (outcome) — aria-expanded can stay false under load.
    await expect(tokenInput).toBeVisible({ timeout: 60000 })
    await tokenInput.fill(otp)
  }

  async clickValidateEmailBtn() {
    await this.page
      .locator('button[type="submit"]', { hasText: 'Validate Email' })
      .click()
  }

  /**
   * After email verification, users land on Terms or Create Your Workspace.
   * Wait for the primary control on each route (soft wait); URL alone can lag
   * behind client navigation under parallel load.
   */
  async proceedAfterEmailVerification() {
    const termsNext = this.page.getByTestId('TermsAndConditionsNextButton')
    const workspaceHeading = this.page.getByRole('heading', {
      name: 'Create Your Workspace'
    })
    await expect(termsNext.or(workspaceHeading)).toBeVisible({ timeout: 90000 })

    if (await termsNext.isVisible()) {
      await this.clickIAgreeBtn()
      await this.clickNextBtn()
      return
    }

    await expect(workspaceHeading).toBeVisible({ timeout: 30000 })
    const createWorkspaceButton = this.page.getByRole('button', {
      name: 'Create'
    })
    // Deterministic workspace path: some users do not get prefilled titles.
    if (!(await createWorkspaceButton.isEnabled())) {
      const fallbackTeamTitle = `Team ${randomNumber}`
      await this.page.locator('input#title').fill(fallbackTeamTitle, {
        timeout: 30000
      })
      await this.page.locator('input#publicTitle').fill(fallbackTeamTitle, {
        timeout: 30000
      })
    }
    await expect(createWorkspaceButton).toBeEnabled({ timeout: 30000 })
    await createWorkspaceButton.click()
  }

  async clickIAgreeBtn() {
    await this.page.locator('input[aria-labelledby="i-agree-label"]').check()
  }

  async clickNextBtn() {
    const nextBtn = this.page.locator('button[type="button"]', {
      hasText: 'Next'
    })
    await expect(nextBtn).toBeEnabled()
    await nextBtn.click()
  }

  async verifyPageNavigatedFewQuestionsPage() {
    // 50s: onboarding SSR page can be slow after T&C acceptance on first run
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminOnboardingPageWrapper"]',
        { hasText: 'User Insights' }
      )
    ).toBeVisible({ timeout: 50000 })
  }

  async clickNextBtnInFewQuestionPage() {
    const nextBtn = this.page.locator('button[type="submit"]', {
      hasText: 'Next'
    })
    await expect(nextBtn).toBeEnabled()
    await nextBtn.click()
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
    // 90s: cold Vercel SSR + TeamProvider Apollo query can take >70s on first run.
    // NavigationListItemProjects is part of the app shell and loads before team data.
    await expect(
      this.page.getByTestId('NavigationListItemProjects')
    ).toBeVisible({ timeout: 90000 })

    // TeamSelect is disabled while teams query is loading; enabled means Apollo resolved.
    await expect(
      this.page.getByTestId('TeamSelect').locator('[aria-haspopup="listbox"]')
    ).toBeEnabled({ timeout: 90000 })

    const teamSelect = this.page
      .getByTestId('TeamSelect')
      .locator('[role="combobox"]')
    await expect(teamSelect).not.toContainText('Shared With Me', {
      timeout: 90000
    })
    await expect(
      this.page.getByRole('button', { name: 'Create Custom Journey' })
    ).toBeEnabled({ timeout: 90000 })
    this.activeTeamTitle = (await teamSelect.innerText()).trim()
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

  async getActiveTeamTitle() {
    return this.activeTeamTitle
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
