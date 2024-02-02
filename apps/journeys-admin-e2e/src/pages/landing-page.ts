import { expect } from '@playwright/test'
import { Page } from 'playwright-core'

import { isVisible } from '../framework/actions'

export class LandingPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goToAdminUrl(): Promise<void> {
    await this.page.goto('/')
    // Wait for two seconds as the landing page showing 'Sign in with email' button second time 
    // even after clicking the 'Sign in with email' button
    // eslint-disable-next-line
    await this.page.waitForTimeout(2000)
  }

  async clickSignInWithEmail(): Promise<void> {
    await this.page.locator('button[data-provider-id="password"]').click()

    // If the email input is not visible, click the 'Sign in with email' button again
    // as sometimes landing page load was still in flight even after clicking the button
    // and landing page is loading again even after clicking the button
    if (
      !(await this.page
        .locator('input[name="email"]')
        .isVisible({ timeout: 8000 }))
    ) {
      await this.page.locator('button[data-provider-id="password"]').click()
    }
  }

  async signInWithEmailVisible(): Promise<void> {
    await expect(
      this.page.locator(
        'button[data-provider-id="password"] span.firebaseui-idp-text-long'
      )
    ).toHaveText('Sign in with email')
  }

  async isLandingPage(): Promise<boolean> {
    return await isVisible(
      this.page,
      'button[data-provider-id="password"] span.firebaseui-idp-text-long'
    )
  }
}
