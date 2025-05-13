/* eslint-disable playwright/no-force-option */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect } from '@playwright/test'
import type { Page } from 'playwright-core'

const sixtySecondsTimeout = 60000

export class TemplatePage {
  readonly page: Page
  selecetdTemplated: string
  selectedTeam
  context
  selectedFilterOption: string
  dropdownListBoxPath = 'div[data-popper-placement="bottom"] ul[role="listbox"]'

  constructor(page: Page) {
    this.page = page
  }

  async verifyFilterOfTopicsAndHolidaysAndFeltNeedsAndCollections(
    filterOption: string
  ) {
    await this.clickDropDownOpenIconForFilters(
      'Topics, holidays, felt needs, collections'
    )
    await this.selectCheckBoxesForTopicDropDown(filterOption)
    await this.clickDropDownCloseIconForFilters(
      'Topics, holidays, felt needs, collections'
    )
    await this.verifyTheTemplateOfSelectedFilterOption()
    await this.filterClearIcon()
  }

  // New template library page (landing page)
  async seeAllTemplates(): Promise<void> {
    await this.page.getByRole('link', { name: 'See all', exact: true }).click()
  }

  async templateGalleryCarouselVisible(): Promise<void> {
    const templateGalleryCarouseElement = this.page.getByTestId(
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
    await this.page.getByRole('option', { name: teamName }).click()
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

  async navigateToTemplatePage() {
    await this.page
      .locator('a[data-testid="NavigationListItemTemplates"]')
      .click({ timeout: sixtySecondsTimeout })
    await expect(
      this.page.locator('div[data-testid="TemplateGallery"]')
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async selectExistingTemplate() {
    this.selecetdTemplated = await this.page
      .locator('div[aria-label="templateGalleryCard"] h6')
      .first()
      .innerText()
    await this.page
      .locator('div[aria-label="templateGalleryCard"]')
      .first()
      .click()
  }

  async verifySelectedTemplatePage() {
    await expect(
      this.page.locator('div[data-testid="JourneysAdminTemplateViewHeader"] h1')
    ).toHaveText(this.selecetdTemplated, { timeout: sixtySecondsTimeout })
  }

  async clickUseThisTemplateButton() {
    await this.page
      .locator(
        'div[data-testid="JourneysAdminTemplateViewHeader"] button[data-testid="CreateJourneyButton"]'
      )
      .first()
      .click()
  }

  async selectTeamInAddJourneyToTeamPopup() {
    await this.page
      .locator(
        'div[data-testid="CopyToTeamDialog"][aria-hidden="true"] + div[data-testid="CopyToTeamDialog"]'
      )
      .last()
      .locator(
        'div[data-testid="team-duplicate-select"] div[aria-haspopup="listbox"]'
      )
      .first()
      .click()
    this.selectedTeam = await this.page
      .locator('div[id="menu-teamSelect"] ul[role="listbox"] li')
      .first()
      .getAttribute('aria-label')
    await this.page
      .locator('div[id="menu-teamSelect"] ul[role="listbox"] li')
      .first()
      .click()
  }

  async clickAddBtnInPopup() {
    await this.page
      .locator(
        'div[data-testid="CopyToTeamDialog"][aria-hidden="true"] + div[data-testid="CopyToTeamDialog"]'
      )
      .last()
      .locator('div[data-testid="dialog-action"] button', { hasText: 'Add' })
      .click()
  }

  async verifySelectedTemplateInCustomJourneyPage() {
    await expect(
      this.page.locator(
        'div[data-testid="JourneyDetails"] button[type="button"] p',
        { hasText: this.selecetdTemplated }
      )
    ).toBeVisible({ timeout: sixtySecondsTimeout })
  }

  async clickPreviewBtnInJourneyTemplatePage() {
    await this.page
      .locator(
        'div[data-testid="JourneysAdminTemplateViewHeader"] a[data-testid="PreviewTemplateButton"]'
      )
      .first()
      .click()
  }

  async verifyPreviewTemplateInJourneyTemplate() {
    const [newPage] = await Promise.all([
      this.context.waitForEvent('page'),
      await this.clickPreviewBtnInJourneyTemplatePage()
    ])
    await newPage.waitForLoadState()
    const tabName: string = await newPage.title()
    expect(tabName.includes(this.selecetdTemplated)).toBeTruthy()
    const slidesCount = await newPage
      .locator(
        'div[data-testid="pagination-bullets"] svg[data-testid*="bullet"]'
      )
      .count()
    await expect(
      newPage
        .locator(
          'div[data-testid="pagination-bullets"] svg[data-testid*="bullet"]'
        )
        .first()
    ).toHaveAttribute('data-testid', 'bullet-active')
    if (slidesCount > 1) {
      await newPage
        .locator('button[data-testid="ConductorNavigationButtonNext"]')
        .hover({ force: true })
      await newPage
        .locator('button[data-testid="ConductorNavigationButtonNext"]')
        .click({ force: true })
      await expect(
        newPage
          .locator(
            'div[data-testid="pagination-bullets"] svg[data-testid*="bullet"]'
          )
          .nth(1)
      ).toHaveAttribute('data-testid', 'bullet-active')
    }

    await newPage.close()
  }

  async setBrowserContext(context) {
    this.context = context
  }

  async clickEditInJourneyTemplatePage() {
    await this.page
      .locator(
        'div[data-testid="JourneysAdminTemplateViewHeader"] a[data-testid="TemplateEditButton"]'
      )
      .first()
      .click()
  }

  async verifyTemplateIsEdited(editedText) {
    const [newPage] = await Promise.all([
      this.context.waitForEvent('page'),
      await this.clickPreviewBtnInJourneyTemplatePage()
    ])
    await newPage.waitForLoadState()
    const tabName: string = await newPage.title()
    await newPage.reload({ waitUntil: 'load' })
    expect(tabName.includes(this.selecetdTemplated)).toBeTruthy()
    await newPage.reload({ waitUntil: 'load' })
    const currentTime = new Date()
    const addedSevenMinsTime = new Date(
      new Date().getTime() + 7 * sixtySecondsTimeout
    )
    console.log(`Current time is ${currentTime.toString()}`)
    console.log(`Added wait time is ${addedSevenMinsTime.toString()}`)
    while (new Date() < addedSevenMinsTime) {
      if (new Date() > addedSevenMinsTime) {
        break
      }
      // Wait for the edited content to appear. If it does not appear, the if-else block will handle the situation, so no assertion is needed here.
      try {
        await expect(
          newPage.locator(
            '//div[@data-testid="CardOverlayContentContainer"]//*[@data-testid="JourneysTypography"]',
            { hasText: editedText }
          )
        ).toHaveCount(1, { timeout: 5000 })
        break
      } catch {
        console.log('')
        await newPage.reload({ waitUntil: 'load' })
      }
    }
    console.log(`After while loop ${new Date().toString()}`)
    await expect(
      newPage.locator(
        '//div[@data-testid="CardOverlayContentContainer"]//*[@data-testid="JourneysTypography"]',
        { hasText: editedText }
      )
    ).toHaveCount(1)
  }

  async clickDropDownOpenIconForFilters(filterOption: string) {
    await this.page
      .locator(
        'div[class*="MuiGrid-item"] > div[class*="MuiAutocomplete-root"]',
        { hasText: filterOption }
      )
      .locator('button[aria-label="Open"]')
      .click()
  }

  async selectCheckBoxesForTopicDropDown(option: string) {
    this.selectedFilterOption = await this.page
      .locator(`${this.dropdownListBoxPath} li ul`, { hasText: option })
      .locator('li[role="option"] p')
      .first()
      .innerText()
    await this.page
      .locator(`${this.dropdownListBoxPath} li ul`, { hasText: option })
      .locator('li[role="option"] input')
      .first()
      .click()
  }

  async clickDropDownCloseIconForFilters(filterOption: string) {
    await this.page
      .locator(
        'div[class*="MuiGrid-item"] > div[class*="MuiAutocomplete-root"]',
        { hasText: filterOption }
      )
      .locator('button[aria-label="Close"]')
      .click()
  }

  async verifyTheTemplateOfSelectedFilterOption() {
    await expect(
      this.page.locator(
        'div[data-testid="JourneysAdminTemplateSections"] div[data-testid*="gallery-carousel"]',
        { hasText: this.selectedFilterOption }
      )
    ).toBeVisible({ timeout: sixtySecondsTimeout })
    expect(
      await this.page
        .locator(
          'div[data-testid="JourneysAdminTemplateSections"] div[data-testid*="gallery-carousel"]',
          { hasText: this.selectedFilterOption }
        )
        .locator('a[data-testid="templateGalleryCard"]')
        .count()
    ).toBeGreaterThanOrEqual(1)
  }

  async filterClearIcon() {
    await this.page.locator('button[aria-label="Clear"]').click()
  }

  async hoverTheTopicFilterField() {
    await this.page
      .locator('div[class*="MuiGrid-item"]', {
        hasText: 'Topics, holidays, felt needs, collections'
      })
      .hover()
  }

  async selectCheckBoxForFilters() {
    this.selectedFilterOption = await this.page
      .locator('div[data-popper-placement="bottom"]')
      .getByRole('listbox')
      .getByRole('option')
      .locator('p')
      .first()
      .innerText()
    await this.page
      .locator(`${this.dropdownListBoxPath} li[role="option"] input`)
      .first()
      .click()
  }

  async selectSlideFilters(slideFilter: string) {
    this.selectedFilterOption = slideFilter
    await this.page
      .locator('div[aria-live="polite"] div[class*="swiper-slide"] h3', {
        hasText: slideFilter
      })
      .click()
  }

  async selectFilterBtnBelowSlideFilters(slideFilter: string) {
    this.selectedFilterOption = slideFilter
    await this.page
      .locator(
        'div[data-testid="felt-needs-carousel"] + div button h6[class*="MuiTypography-subtitle2"]',
        { hasText: slideFilter }
      )
      .click()
  }

  async clickHelpBtn() {
    await expect(
      this.page
        .getByTestId('MainPanelBody')
        .locator('button[aria-label="Help"]')
    ).toBeEnabled({ timeout: 30000 })
    await this.page
      .getByTestId('MainPanelBody')
      .locator('button[aria-label="Help"]')
      .click({ delay: 3000 })
  }
}
