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
    await this.page
      .getByPlaceholder('Enter Password')
      .fill(password, { timeout: sixtySecondsTimeout })
  }

  async clickSubmitButton(): Promise<void> {
    await this.page.locator('button[type="submit"]').click()
  }

  async waitUntilDiscoverPageLoaded() {
    // 90s: cold Vercel SSR + TeamProvider Apollo query can take >65s on first run.
    // NavigationListItemProjects is part of the app shell and loads before team data.
    await expect(
      this.page.getByTestId('NavigationListItemProjects')
    ).toBeVisible({ timeout: 90000 })

    // TeamSelect is disabled={query.loading} while the teams Apollo query is in
    // flight (see TeamSelect.tsx). Enabled means the query resolved and the page
    // is fully interactive — regardless of which team (or Shared With Me) is active.
    await expect(
      this.page.getByTestId('TeamSelect').locator('[aria-haspopup="listbox"]')
    ).toBeEnabled({ timeout: 30000 })
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

  async logInWithCreatedNewUser(userName: string, expectedTeamTitle?: string) {
    await this.fillExistingEmail(userName)
    console.log(`userName : ${userName}`)
    await this.clickSubmitButton()
    const password = await getPassword()
    await this.fillExistingPassword(password)
    await this.clickSubmitButton()
    await this.waitUntilNewUserDiscoverPageLoaded(expectedTeamTitle)
  }

  private async getTeamSelectCombobox() {
    return this.page.getByTestId('TeamSelect').locator('[role="combobox"]')
  }

  async assertSharedWithMeDiscoverState() {
    const teamSelect = await this.getTeamSelectCombobox()
    await expect(teamSelect).toContainText('Shared With Me', { timeout: 90000 })
    await expect(
      this.page.getByRole('button', { name: 'Create Custom Journey' })
    ).toHaveCount(0)
  }

  async assertCreatedTeamDiscoverState(expectedTeamTitle?: string) {
    const teamSelect = await this.getTeamSelectCombobox()
    for (let attempt = 0; attempt < 3; attempt++) {
      if ((await teamSelect.innerText()).includes('Shared With Me')) {
        if (attempt === 2) break
        await this.page.waitForTimeout(5000)
        await this.page.reload()
        await expect(
          this.page.getByTestId('NavigationListItemProjects')
        ).toBeVisible({ timeout: 90000 })
        await expect(
          this.page
            .getByTestId('TeamSelect')
            .locator('[aria-haspopup="listbox"]')
        ).toBeEnabled({ timeout: 90000 })
        continue
      }
      break
    }
    await expect(teamSelect).not.toContainText('Shared With Me', {
      timeout: 1000
    })
    if (expectedTeamTitle != null && expectedTeamTitle.trim() !== '') {
      await expect(teamSelect).toContainText(expectedTeamTitle)
    }
    await expect(
      this.page.getByRole('button', { name: 'Create Custom Journey' })
    ).toBeEnabled({ timeout: 90000 })
  }

  private async waitUntilNewUserDiscoverPageLoaded(expectedTeamTitle?: string) {
    await expect(
      this.page.getByTestId('NavigationListItemProjects')
    ).toBeVisible({ timeout: 90000 })

    await expect(
      this.page.getByTestId('TeamSelect').locator('[aria-haspopup="listbox"]')
    ).toBeEnabled({ timeout: 90000 })

    await this.assertCreatedTeamDiscoverState(expectedTeamTitle)
  }
}
