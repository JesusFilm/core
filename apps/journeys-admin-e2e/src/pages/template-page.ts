import { Page } from 'playwright-core'
import { expect } from '@playwright/test'

export class TemplatePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // New template library page (landing page)
  async seeAllTemplates(): Promise<void> {
    await this.page.getByRole('link', { name: 'See all', exact: true }).click()
  }

  async templateGalleryCarouselVisible(): Promise<void> {
    const templateGalleryCarouseElement = await this.page.getByTestId(
      '-template-gallery-carousel'
    )
    await templateGalleryCarouseElement.isVisible()
  }

  // Shows all templates in a category
  async clickTemplateCategory(templateCategory: string): Promise<void> {
    await this.page.getByRole('button', { name: templateCategory }).click()
  }

  // Test correct template category is selected
  async correctTemplateCategoryFiltered(
    chosenTemplaeCategory: string
  ): Promise<void> {
    // Test chosen category is selected
    expect(
      await this.page.textContent(
        'div.MuiAutocomplete-tagSizeMedium span.MuiChip-label'
      )
    ).toContain(chosenTemplaeCategory)

    // Test chosen category came up in filtered results
    expect(await this.page.getByTestId(`${chosenTemplaeCategory}-template-gallery-carousel`).textContent()).toContain(chosenTemplaeCategory)
  }


  // Template details page
  async clickTemplate(templateCategory: string): Promise<void> {
    await this.page
      .getByTestId(`${templateCategory}-template-gallery-carousel`)
      .getByTestId('journey-1c5bce8b-df6a-4dcc-a623-0ab683a9dddf')
      .click()
  }

  // Test correct template is displayed
  async correctTemplateDisplayed(templateName: string): Promise<void> {
    expect(
      await this.page
      .getByTestId('JourneysAdminTemplateViewHeader')
      .locator('div.MuiTypography-h1').textContent()
    ).toContain(templateName)
  }

  // Journey list page
  async addTemplateJourneyToTeam(): Promise<void> {
    await this.page
      .getByTestId('JourneysAdminTemplateViewHeader')
      .getByRole('button', { name: 'Use This Template' })
      .click()
    await this.page.getByLabel('Select Team').click()
    await this.page
      .getByRole('option', { name: 'Team Name-1699922098237' })
      .click()
    await this.page.getByRole('button', { name: 'Add' }).click()
  }
}
