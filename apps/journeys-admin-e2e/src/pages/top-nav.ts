import { Page } from 'playwright-core'
import { expect } from '@playwright/test'

export class TopNav {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async clickTeamName(teamName: string): Promise<void> {
    await this.page.getByRole('button', { name: teamName }).click()
  }

  async testTeamName(teamName: string): Promise<void> {
    // Test that Team details are recorded correctly
    const teamNameLocatoreInDropdown =
      'ul[role="listbox"] li[aria-selected="true"]'
    expect(await this.page.textContent(teamNameLocatoreInDropdown)).toContain(
      teamName
    )
  }

  async clickSharedWithMe(): Promise<void> {
    await this.page.getByRole('button', { name: 'Shared with me' }).click()
  }
}
