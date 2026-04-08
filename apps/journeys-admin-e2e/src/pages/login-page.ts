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
    // 90s: cold Vercel SSR + TeamProvider Apollo query can take >65s on first run
    await expect(this.page.locator('input#username')).toBeHidden({
      timeout: 90000
    })
    await expect(this.page.getByTestId('MainPanelHeader')).toBeVisible({
      timeout: 90000
    })
    const teamSelectTrigger = this.page
      .getByTestId('TeamSelect')
      .locator('div[aria-haspopup="listbox"]')
    await expect(teamSelectTrigger).toBeVisible({ timeout: 90000 })
    await expect(teamSelectTrigger).toBeEnabled({ timeout: 90000 })
    const createButton = this.page.getByRole('button', {
      name: 'Create Custom Journey'
    })
    await expect(createButton).toBeVisible({ timeout: 90000 })
    await expect(createButton).toBeEnabled({ timeout: 90000 })
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
