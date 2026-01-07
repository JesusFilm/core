import type { Page } from '@playwright/test'

const sixtySecondsTimeout = 60000

export class LeftNav {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async clickProfile(): Promise<void> {
    try {
      const profileListItem = this.page.locator(
        '[data-testid="NavigationListItemProfile"]'
      )
      await profileListItem.waitFor({ timeout: 60000 })

      // Click on Profile
      await profileListItem.click()
    } catch (error) {
      throw new Error(
        'Profile list item is not visible after waiting for a minute'
      )
    }
  }

  async getName(): Promise<string> {
    const name = await this.page.textContent(
      'div.MuiMenu-paper div p.MuiTypography-body1'
    )
    return name ?? ''
  }

  async getEmail(): Promise<string> {
    const email = await this.page.textContent(
      'div.MuiMenu-paper div p.MuiTypography-body2'
    )
    return email ?? ''
  }

  async logout(): Promise<void> {
    // Click on Log out
    await Promise.all([
      this.page
        .locator('[data-testid="JourneysAdminMenuItemLogOut"]')
        .waitFor(),
      this.page.click('[data-testid="JourneysAdminMenuItemLogOut"]')
    ])
  }
}
