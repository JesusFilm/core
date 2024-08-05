/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import { Page } from 'playwright-core'

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
    await this.page.getByPlaceholder('Enter Password').fill(password)
  }

  async clickSubmitButton(): Promise<void> {
    await this.page.locator('button[type="submit"]').click()
  }

  async waitUntilDiscoverPageLoaded() {
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminContainedIconButton"] button'
      )
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async login(): Promise<void> {
    const email = await getEmail()
    await this.fillExistingEmail(email)
    await this.clickSubmitButton()
    const password = await getPassword()
    await this.fillExistingPassword(password)
    await this.clickSubmitButton()
  }

  async logInWithCreatedNewUser(userName: string) {
    await this.fillExistingEmail(userName)
    await this.clickSubmitButton()
    const password = await getPassword()
    await this.fillExistingPassword(password)
    await this.clickSubmitButton()
    await this.waitUntilDiscoverPageLoaded()
  }
}
