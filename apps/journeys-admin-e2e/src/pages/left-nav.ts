import { Page } from 'playwright-core'

const sixtySecondsTimeout = 60000

export class LeftNav {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async clickProfile(): Promise<void> {
    try {
      // eslint-disable-next-line playwright/no-wait-for-selector
      const profileListItem = await this.page.waitForSelector(
        '[data-testid="NavigationListItemProfile"]',
        { timeout: sixtySecondsTimeout }
      )

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
      // eslint-disable-next-line playwright/no-wait-for-selector
      this.page.waitForSelector('[data-testid="JourneysAdminMenuItemLogOut"]'),
      this.page.click('[data-testid="JourneysAdminMenuItemLogOut"]')
    ])
  }
}
