/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const thirtySecondsTimeout = 30000

export class ProfilePage {
  readonly page: Page
  selectedLanguage: string
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
    ).toBeVisible({ timeout: 30000 })
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
    ).toBeHidden({ timeout: 30000 })
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
    ).toBeHidden({ timeout: 30000 })
  }

  async verifyloggedOut() {
    await expect(this.page.locator('input#username')).toBeVisible({
      timeout: 30000
    })
  }

  async clickLanguageOption() {
    await this.page
      .locator('li[data-testid="JourneysAdminMenuItemLanguage"]')
      .click()
  }

  async enterLanguage(language: string) {
    const selectedValue = await this.page
      .locator('div[role="dialog"] div[aria-haspopup="listbox"] p')
      .innerText()
    this.selectedLanguage = selectedValue === language ? 'français' : language
    await this.page
      .locator('div[role="dialog"] div[aria-haspopup="listbox"]')
      .click()
    await expect(this.page.locator('span[role="progressbar"]')).toBeHidden({
      timeout: 30000
    })
    await this.page
      .locator('ul[role="listbox"] li[role="option"]', {
        hasText: this.selectedLanguage
      })
      .first()
      .click({ timeout: 30000 })
  }

  async verifySelectedLanguageUpdatedInChangeLangPopup() {
    await expect(
      this.page.locator('div[role="dialog"] div[aria-haspopup="listbox"] p', {
        hasText: this.selectedLanguage
      })
    ).toBeVisible()
  }

  async verifySelectedLanguageUpdatedOnTheSite() {
    const sampleText =
      this.selectedLanguage === 'français' ? 'Langue' : 'Lengua'
    await expect(
      this.page.locator('li[data-testid="JourneysAdminMenuItemLanguage"]', {
        hasText: sampleText
      })
    ).toBeVisible()
  }

  async popupCloseBtn() {
    await this.page.locator('button[data-testid="dialog-close-button"]').click()
  }
}
