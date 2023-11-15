import { Page } from 'playwright-core'
import { expect } from '@playwright/test'

export class LandingPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goToAdminUrl(): Promise<void> {
    await this.page.goto('/');
  }

  async clickSignInWithEmail(): Promise<void> {
    await this.page.locator('button[data-provider-id="password"]').click();
  }

  async signInWithEmailVisible(): Promise<void> {
    await expect(this.page.locator('button[data-provider-id="password"] span.firebaseui-idp-text-long')).toHaveText('Sign in with email')
  }
}
