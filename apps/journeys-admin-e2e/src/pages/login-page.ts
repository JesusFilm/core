import { expect } from '@playwright/test'
import { Page } from 'playwright-core'

import { getEmail, getPassword } from '../framework/helpers'

export class LoginPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async fillExistingEmail(email: string): Promise<void> {
    await this.page.getByLabel('Email').fill(email)
    await expect(this.page.locator('input[name="email"]')).toHaveValue(email)
  }

  async clickNextButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Next' }).click()
  }

  async fillExistingPassword(password: string): Promise<void> {
    await this.page.getByLabel('Password').fill(password)
  }

  async clickSubmitButton(): Promise<void> {
    await this.page.locator('button[type="submit"]').click()
  }

  async login(): Promise<void> {
    const email = await getEmail()
    await this.fillExistingEmail(email)
    await this.clickNextButton()
    const password = await getPassword()
    await this.fillExistingPassword(password)
    await this.clickSubmitButton()
  }
}
