import { Page } from 'playwright-core'
import { expect } from '@playwright/test'

export class LandingPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async open(): Promise<void> {
    await this.page.goto('https://journeys-admin-2024-jesusfilm.vercel.app/');
  }

  async isSignInWithEmailVisible(): Promise<boolean> {
    return await this.page.isVisible('button[data-provider-id="password"]')
  }

  async clickSignInWithEmail(): Promise<void> {
    await this.page.locator('button[data-provider-id="password"]').click();
  }
}
