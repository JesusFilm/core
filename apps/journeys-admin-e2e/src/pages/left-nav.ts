import exp from 'constants'

import { expect } from '@playwright/test'
import { Page } from 'playwright-core'

import { isCorrectText, isVisible } from '../framework/actions'

export class LeftNav {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async clickProfile(): Promise<void> {
    try {
      const profileListItem = await this.page.waitForSelector('[data-testid="NavigationListItemProfile"]', { timeout: 60000 });
      
      // Click on Profile
      await profileListItem.click();
    } catch (error) {
      throw new Error("Profile list item is not visible after waiting for a minute");
    }
  }

  async getName(): Promise<string> {
    const name = await this.page.textContent('div.MuiMenu-paper div p.MuiTypography-body1')
    return name ?? ''
  }

  async getEmail(): Promise<string> {
    const email = await this.page.textContent('div.MuiMenu-paper div p.MuiTypography-body2')
    return email ?? ''
  }
  
  async logout(): Promise<void> {
    // Click on Log out
    await this.page.click('div ul li[role="menuitem"]')
  }
}
