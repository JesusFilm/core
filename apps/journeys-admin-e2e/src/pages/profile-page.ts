/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import { Page } from 'playwright-core'

const thirtySecondsTimeout = 30000

export class ProfilePage {
  readonly page: Page
  constructor(page: Page) {
    this.page = page
  }

  async clickProfileIconInNavBar() {
    await this.page
      .locator('div[data-testid="NavigationListItemProfile"]')
      .click()
  }

  async clickEmailPreferences() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItemEmailPreferences"]')
      .click()
  }

  async verifyEmailPreferencePage() {
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminOnboardingPageWrapper"] h4',
        { hasText: 'Email Preferences' }
      )
    ).toBeVisible({ timeout: thirtySecondsTimeout })
  }

  async clickAccountNotification() {
    await this.page.locator('input[name="accountNotifications"]').click()
    await expect(
      this.page.locator('#notistack-snackbar', {
        hasText: 'Email Preferences Updated.'
      })
    ).toBeVisible()
    await expect(
      this.page.locator('#notistack-snackbar', {
        hasText: 'Email Preferences Updated.'
      })
    ).toBeHidden({ timeout: thirtySecondsTimeout })
  }

  async activateAccountNotification() {
    if (
      !(await this.page
        .locator(
          "span[class*='Mui-checked'] input[name='accountNotifications']"
        )
        .isHidden())
    ) {
      await this.clickAccountNotification()
    }
    await this.clickAccountNotification()
    await expect(
      this.page.locator(
        "span[class*='Mui-checked'] input[name='accountNotifications']"
      )
    ).toBeVisible()
  }

  async deactivateAccountNotification() {
    if (
      await this.page
        .locator(
          "span[class*='Mui-checked'] input[name='accountNotifications']"
        )
        .isHidden()
    ) {
      await this.clickAccountNotification()
    }
    await this.clickAccountNotification()
    await expect(
      this.page.locator(
        "span[class*='Mui-checked'] input[name='accountNotifications']"
      )
    ).toBeHidden()
  }

  async clickDoneBtn() {
    await this.page
      .locator('div[data-testid="JourneysAdminOnboardingPageWrapper"] a', {
        hasText: 'Done'
      })
      .click()
  }

  async clickLogout() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItemLogOut"]')
      .click()
  }

  async verifyLogoutToastMsg() {
    await expect(
      this.page.locator('#notistack-snackbar', { hasText: 'Logout successful' })
    ).toBeVisible()
    await expect(
      this.page.locator('#notistack-snackbar', { hasText: 'Logout successful' })
    ).toBeHidden({ timeout: thirtySecondsTimeout })
  }

  async verifyloggedOut() {
    await expect(this.page.locator('input#username')).toBeVisible({
      timeout: thirtySecondsTimeout
    })
  }
}
