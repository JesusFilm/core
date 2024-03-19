import { Page } from 'playwright-core'

export class JourneyPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // Create a custom journey
  async createCustomJourney(): Promise<void> {
    await this.page
      .getByRole('button', { name: 'Create Custom Journey' })
      .click()
    await this.page
      .getByTestId('CardItem-7766fd12-8534-42b6-980d-44a9e0031234')
      .locator('div')
      .nth(2)
      .click()
    await this.page.getByTestId('Fab').click()
    await this.page.getByRole('button', { name: 'Image' }).click()
    await this.page
      .getByRole('button', { name: 'white dome building during daytime' })
      .click()
    await this.page.getByRole('link', { name: 'Preview' }).click()
  }
}
