/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import type { Page } from 'playwright-core'

import { getEmail, getPassword } from '../framework/helpers'

const sixtySecondsTimeout = 60000

export class LoginPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async fillExistingEmail(email: string): Promise<void> {
    await this.page
      .getByPlaceholder('Enter your email address here')
      .fill(email)
    await expect(this.page.locator('input[type="email"]')).toHaveValue(email)
  }

  async fillExistingPassword(password: string): Promise<void> {
    // The sign-in flow is two-staged:
    //   1. HomePage shows email field + a hidden `aria-label="password-input"`
    //      stub used purely for browser autofill.
    //   2. After the email is submitted Firebase replies with the matching
    //      sign-in method; if it's `password`, the app navigates to PasswordPage
    //      which renders the *real* password field with placeholder
    //      "Enter Password".
    // The transition is asynchronous (Firebase round-trip), so we explicitly
    // wait for the visible password field to mount before typing — otherwise
    // we race the navigation and time out.
    const passwordField = this.page.getByPlaceholder('Enter Password')
    await expect(passwordField).toBeVisible({ timeout: sixtySecondsTimeout })
    await passwordField.fill(password)
  }

  async clickSubmitButton(): Promise<void> {
    await this.page.locator('button[type="submit"]').click()
  }

  async ensureActiveTeamSelected(): Promise<void> {
    const teamSelect = this.page.getByTestId('TeamSelect')
    await expect(teamSelect).toBeVisible({ timeout: sixtySecondsTimeout })
    const combobox = teamSelect.locator('div[aria-haspopup="listbox"]')
    const selectedTeamLabel = (await combobox.innerText()).trim()
    if (selectedTeamLabel === 'Shared With Me') {
      await combobox.click()
      const teamOption = this.page
        .locator('ul[role="listbox"] li[role="option"]')
        .filter({ hasNotText: 'Shared With Me' })
        .first()
      await expect(teamOption).toBeVisible({ timeout: sixtySecondsTimeout })
      await teamOption.click()
      await expect(combobox).not.toHaveText('Shared With Me', {
        timeout: sixtySecondsTimeout
      })
    }
  }

  async waitUntilDiscoverPageLoaded() {
    await expect(
      this.page.getByTestId('JourneysAdminJourneyList')
    ).toBeVisible({ timeout: 90000 })
    await this.ensureActiveTeamSelected()
    await expect(
      this.page.getByRole('button', { name: 'Create Custom Journey' })
    ).toBeEnabled({ timeout: 90000 })
  }

  async login(accountKey: string = 'admin'): Promise<void> {
    const email = await getEmail(accountKey)
    await this.fillExistingEmail(email)
    await this.clickSubmitButton()
    const password = await getPassword(accountKey)
    await this.fillExistingPassword(password)
    await this.clickSubmitButton()
    await this.waitUntilDiscoverPageLoaded()
  }

  async logInWithCreatedNewUser(userName: string) {
    await this.fillExistingEmail(userName)
    console.log(`userName : ${userName}`)
    await this.clickSubmitButton()
    const password = await getPassword()
    await this.fillExistingPassword(password)
    await this.clickSubmitButton()
    await this.waitUntilDiscoverPageLoaded()
  }
}
