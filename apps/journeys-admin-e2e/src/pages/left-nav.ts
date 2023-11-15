import { Page } from 'playwright-core'
import { expect } from '@playwright/test'

export class LeftNav {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async clickProfile(): Promise<void> {
    // Click on Profile
    await this.page.getByTestId('NavigationListItemProfile').click()
  }

  async testUserDetails(
    firstAndLastName: string,
    email: string
  ): Promise<void> {
    // Test name is correct
    expect(
      await this.page.textContent('div.MuiMenu-paper div p.MuiTypography-body1')
    ).toContain(firstAndLastName)
    // Test email is correct
    expect(
      await this.page.textContent('div.MuiMenu-paper div p.MuiTypography-body2')
    ).toContain(email)
  }

  async logout(): Promise<void> {
    // Click on Log out
    await this.page.click('div ul li[role="menuitem"]')
  }
}
