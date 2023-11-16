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
    expect(
      await this.page
        .getByTestId(`${chosenTemplaeCategory}-template-gallery-carousel`)
        .textContent()
    ).toContain(chosenTemplaeCategory)
  }

  // Template details page
  async clickTemplate(templateCategory: string): Promise<void> {
    await this.page
      .getByTestId(`${templateCategory}-template-gallery-carousel`)
      .getByRole('img', { name: 'photo-1544164559-90f4302d5142' })
      .click()
  }

  // Test correct template is displayed
  async correctTemplateDisplayed(templateName: string): Promise<void> {
    expect(
      await this.page.getByRole('heading', { name: templateName }).textContent()
    ).toContain(templateName)
  }

  // Use template
  async useTemplate(teamName: string): Promise<void> {
    await this.page
      .getByTestId('JourneysAdminTemplateViewHeader')
      .getByRole('button', { name: 'Use Template' })
      .click()
    await this.page.getByLabel('Select Team').click()
    await this.page
      .getByRole('option', { name: teamName })
      .click()
    await this.page.getByRole('button', { name: 'Add' }).click()
  }

  // Template details page displayed
  async templateDetailsPageDisplayed(visibleText: string): Promise<void> {
    expect(
      await this.page.textContent(
        'div.MuiAutocomplete-tagSizeMedium span.MuiChip-label'
      )
    ).toContain(visibleText)
  }

  // Create a custom journey
  async createCustomJourney(): Promise<void> {
    await this.page.getByRole('button', { name: 'Create Custom Journey' }).click();
    await this.page.getByTestId('CardItem-7766fd12-8534-42b6-980d-44a9e0031234').locator('div').nth(2).click();
    await this.page.getByTestId('Fab').click();
    await this.page.getByRole('button', { name: 'Image' }).click();
    await this.page.getByRole('button', { name: 'white dome building during daytime' }).click();
    await this.page.getByRole('link', { name: 'Preview' }).click();
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
