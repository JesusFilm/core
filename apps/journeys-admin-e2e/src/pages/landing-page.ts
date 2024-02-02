import { expect } from '@playwright/test'
import { Page } from 'playwright-core'

import { isVisible } from '../framework/actions'
import { time } from 'console'

export class LandingPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goToAdminUrl(): Promise<void> {
    await this.page.goto('/')

    // Wait for the landing page to load fully otherwise 'Sign in with email' button coming twice
    await this.page.waitForResponse((response) => {
      return (
        /api-gateway.*.jesusfilm.org/.test(response.url()) &&
        response.status() === 200
      )
    })
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
