import { Page } from 'playwright-core'

export class HomePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async seeAllTemplates(): Promise<void> {
    await this.page.getByRole('link', { name: 'See all', exact: true }).click()
  }
}
