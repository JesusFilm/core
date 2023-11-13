import { Page } from 'playwright-core'
import { expect } from '@playwright/test'

export class LandingPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async open(): Promise<void> {
    await this.page.goto('https://journeys-admin-2024-jesusfilm.vercel.app/')
  }

  async clickSignInWithEmail(): Promise<void> {
    await this.page.getByRole('button', { name: 'Sign in with email' }).click()
  }

  async hasUserLoggedOutSuccessfully(): Promise<boolean> {
    return await this.page.isVisible('button[data-provider-id="password"]')
  }
}
