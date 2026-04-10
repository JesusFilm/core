/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import type { Page } from 'playwright-core'

import { getEmail, getPassword } from '../framework/helpers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    await this.page.getByPlaceholder('Enter Password').fill(password)
  }

  async clickSubmitButton(): Promise<void> {
    await this.page.locator('button[type="submit"]').click()
  }

  async waitUntilDiscoverPageLoadedAsAdmin(): Promise<void> {
    // Admin accounts have no sessionStorage team ID so TeamProvider resolves
    // their last active team from the DB. If none is set, they land in
    // "Shared With Me" mode. Wait for the TeamSelect combobox to become
    // enabled: it is disabled (aria-disabled="true") while query.loading is
    // true and enabled in both Shared With Me and team mode once resolved.
    // 90s: cold Vercel SSR + TeamProvider Apollo query can be slow on CI.
    await expect(
      this.page.getByTestId('TeamSelect').getByRole('combobox')
    ).toBeEnabled({ timeout: 90000 })
  }

  async waitUntilDiscoverPageLoadedAsUser(): Promise<void> {
    // Newly-created users complete onboarding with a team, so they always land
    // in team mode with the "Create Custom Journey" button enabled.
    // 90s: cold Vercel SSR + TeamProvider Apollo query can be slow on CI.
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
    await this.waitUntilDiscoverPageLoadedAsAdmin()
  }

  async logInWithCreatedNewUser(userName: string) {
    await this.fillExistingEmail(userName)
    await this.clickSubmitButton()
    const password = await getPassword()
    await this.fillExistingPassword(password)
    await this.clickSubmitButton()
    await this.waitUntilDiscoverPageLoadedAsUser()
  }
}
