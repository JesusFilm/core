import { Page } from 'playwright-core'
import { expect } from '@playwright/test'
export class LoginPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async fillExistingEmail(email: string): Promise<void> {
    await this.page.getByLabel('Email').fill(email)
    expect(await this.page.locator('input[name="email"]').inputValue()).toBe(email)
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

  async login(email: string, password: string): Promise<void> {
    await this.fillExistingEmail(email)
    await this.clickNextButton()
    await this.fillExistingPassword(password)
    await this.clickSubmitButton()
  }
}
