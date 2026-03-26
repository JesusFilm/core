/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import type { Page } from 'playwright-core'

import { getEmail, getPassword } from '../framework/helpers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sixtySecondsTimeout = 60000

export class LoginPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async fillExistingEmail(email: string): Promise<void> {
    await this.page
      .getByPlaceholder('Enter your email address here')
      .fill(email)
    await expect(this.page.locator('input[type="email"]')).toHaveValue(email)
  }

  async fillExistingPassword(password: string): Promise<void> {
    await this.page.getByPlaceholder('Enter Password').fill(password)
  }

  async clickSubmitButton(): Promise<void> {
    await this.page.locator('button[type="submit"]').click()
  }

  async waitUntilDiscoverPageLoaded() {
    // Wait for the nav shell to be present – a reliable signal that the app has loaded.
    await expect(
      this.page.getByTestId('NavigationListItemProjects')
    ).toBeVisible({ timeout: 65000 })

    // CreateJourneyButton is only rendered when an active team exists. If the user
    // has no active team (TeamSelect shows "Shared With Me"), select the first real
    // team so the button appears.
    const containedIconButton = this.page.locator(
      'div[data-testid="JourneysAdminContainedIconButton"]'
    )
    const isVisible = await containedIconButton
      .isVisible()
      .catch(() => false)

    if (!isVisible) {
      await this.selectFirstAvailableTeam()
    }

    await expect(containedIconButton).toBeVisible({ timeout: 65000 })
  }

  private async selectFirstAvailableTeam() {
    const teamSelectDropdown = this.page
      .getByTestId('TeamSelect')
      .locator('div[aria-haspopup="listbox"]')

    // Only attempt if the team dropdown is present (e.g. admin users may not have it)
    const dropdownVisible = await teamSelectDropdown
      .isVisible()
      .catch(() => false)
    if (!dropdownVisible) return

    await teamSelectDropdown.click()
    const firstRealTeam = this.page
      .locator('ul[role="listbox"] li[role="option"]')
      .filter({ hasNotText: 'Shared With Me' })
      .first()
    const hasRealTeam = await firstRealTeam.isVisible().catch(() => false)
    if (hasRealTeam) {
      await firstRealTeam.click()
    } else {
      // Dismiss the listbox if no real team exists
      await this.page.keyboard.press('Escape')
    }
  }

  async login(accountKey: string = 'admin'): Promise<void> {
    const email = await getEmail(accountKey)
    await this.fillExistingEmail(email)
    await this.clickSubmitButton()
    const password = await getPassword(accountKey)
    await this.fillExistingPassword(password)
    await this.clickSubmitButton()
    await this.waitUntilDiscoverPageLoaded()
  }

  async logInWithCreatedNewUser(userName: string) {
    await this.fillExistingEmail(userName)
    console.log(`userName : ${userName}`)
    await this.clickSubmitButton()
    const password = await getPassword()
    await this.fillExistingPassword(password)
    await this.clickSubmitButton()
    await this.waitUntilDiscoverPageLoaded()
  }
}
