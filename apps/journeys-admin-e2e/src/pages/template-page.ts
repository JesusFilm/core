import { Page } from 'playwright-core'

export class TemplatePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // New template library page (landing page)
  async seeAllTemplates(): Promise<void> {
    await this.page.getByRole('link', { name: 'See all', exact: true }).click()
  }

  // Shows all templates in a category
  async clickTemplateCategory(templateCategory: string): Promise<void> {
    await this.page.getByRole('button', { name: templateCategory }).click()
  }

  // Template details page  
  async clickTemplate(): Promise<void> {
    await this.page
      .getByTestId('Featured& New-template-gallery-carousel')
      .getByRole('img', { name: 'photo-1544164559-90f4302d5142' })
      .click()
  }

  // Journey list page
  async addTemplateJourneyToTeam(): Promise<void> {
    await this.page.getByTestId('JourneysAdminTemplateViewHeader').getByRole('button', { name: 'Use This Template' }).click();
    await this.page.getByLabel('Select Team').click();
    await this.page.getByRole('option', { name: 'Team Name-1699922098237' }).click();
    await this.page.getByRole('button', { name: 'Add' }).click();
  }

}
