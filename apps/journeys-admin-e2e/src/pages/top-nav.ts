import { expect } from '@playwright/test'
import { Page } from '@playwright/test'

export class TopNav {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async teamNameVisible(teamName: string): Promise<void> {
    const teamNameElement = this.page.getByRole('button', { name: teamName })
    await teamNameElement.isVisible()
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

  async getTeamName(): Promise<string> {
    const teamName = await this.page.textContent(
      'ul[role="listbox"] li[aria-selected="true"]'
    )
    return teamName ?? ''
  }

  async clickSharedWithMe(): Promise<void> {
    await this.page.getByRole('button', { name: 'Shared with me' }).click()
  }
}
