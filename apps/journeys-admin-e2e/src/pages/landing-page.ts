import { expect } from '@playwright/test'
import { Page } from 'playwright-core'

import { isVisible } from '../framework/actions'
import { getBaseUrl } from '../framework/helpers'

export class LandingPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goToAdminUrl(): Promise<void> {
    const baseURL = await getBaseUrl()
    await this.page.goto(baseURL)
    // Wait for two seconds as the landing page can briefly show the submit button twice
    // after clicking Continue with email (matches HomePage.tsx / admin.nextstep.is)
    // eslint-disable-next-line
    await this.page.waitForTimeout(2000)
  }

  async signInWithEmailVisible(): Promise<void> {
    await expect(this.page.locator('button[type="submit"]')).toHaveText(
      'Continue with email'
    )
  }

  async isLandingPage(): Promise<boolean> {
    return await isVisible(this.page, 'button[type="submit"]')
  }
}
