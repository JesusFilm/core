/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import type { Page } from 'playwright-core'

import { getEmail, getPassword } from '../framework/helpers'

const seventySecondsTimeout = 70000

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
    await this.page
      .getByPlaceholder('Enter Password')
      .fill(password, { timeout: 30000 })
  }

  async clickSubmitButton(): Promise<void> {
    const button_path = this.page.locator('button[type="submit"]')
    await expect(button_path).toBeEnabled()
    await button_path.click()
  }

  async waitUntilDiscoverPageLoaded() {
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminContainedIconButton"] button'
      )
    ).toBeVisible({ timeout: seventySecondsTimeout })
  }

  // async verifyCreateCustomJourneyBtn() {
  //   await expect(this.page.locator('div[aria-haspopup="listbox"]')).toBeVisible({ timeout: seventySecondsTimeout })
  //   await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 })
  //   // verifying 'Create custom journey' button is display. if not, then select first team in the catch block to display 'Create custom journey' button.
  //   await expect(this.page.locator('div[data-testid="JourneysAdminContainedIconButton"] button')).toBeVisible().catch(async () => {
  //     await this.selectFirstTeam()
  //   })
  //   // verifying whether the 'Shared With Me' option is selected or. if it is, then select first team in the catch block to display 'Create custom journey' button.
  //   await expect(this.page.locator('div[aria-haspopup="listbox"]', { hasText: 'Shared With Me' })).toBeHidden().catch(async () => {
  //     await this.selectFirstTeam()
  //   })

  // }
  // async selectFirstTeam() {
  //   await this.page.locator('div[aria-haspopup="listbox"]').click({ timeout: seventySecondsTimeout })
  //   await this.page.locator('ul[role="listbox"] li[role="option"]').first().click()
  // }

  async login(): Promise<void> {
    const email = await getEmail()
    await this.fillExistingEmail(email)
    await this.clickSubmitButton()
    const password = await getPassword()
    await this.fillExistingPassword(password)
    await this.clickSubmitButton()
    await this.waitUntilDiscoverPageLoaded()
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
