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

  async waitUntilDiscoverPageLoaded() {
    await expect(
      this.page.locator('div[data-testid="JourneysAdminContainedIconButton"]')
    ).toBeVisible({ timeout: 65000 })
  }

  // async verifyCreateCustomJourneyBtn() {
  //   await expect(this.page.locator('div[aria-haspopup="listbox"]')).toBeVisible({ timeout: 60000 })
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
  //   await this.page.locator('div[aria-haspopup="listbox"]').click({ timeout: 60000 })
  //   await this.page.locator('ul[role="listbox"] li[role="option"]').first().click()
  // }

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
