import { expect } from '@playwright/test'
import type { FrameLocator, Locator, Page } from 'playwright-core'

export const DEFAULT_HERO_TITLE = 'Share the story of Christmas'
export const NEW_REGION_NAME = 'New region'

export class CampaignBuilderPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /** The editor canvas renders the campaign page inside this iframe. */
  get canvas(): FrameLocator {
    return this.page.frameLocator('iframe[title="Campaign preview"]')
  }

  get heroTitleInput(): Locator {
    return this.canvas.getByRole('textbox', { name: 'Title' })
  }

  async goToCampaigns(): Promise<void> {
    await this.page.goto('/campaigns')
    await expect(
      this.page.getByRole('heading', { name: 'Campaigns' })
    ).toBeVisible()
  }

  async createCampaign(title: string, languageName: string): Promise<void> {
    const createButton = this.page.getByRole('button', {
      name: 'Create campaign',
      exact: true
    })
    // 90s: cold Vercel SSR + TeamProvider Apollo query can take >65s on first run
    await expect(createButton).toBeEnabled({ timeout: 90000 })
    await createButton.click()

    const dialog = this.page.getByRole('dialog')
    await dialog.getByRole('textbox', { name: 'Title' }).fill(title)
    await dialog.getByPlaceholder('Search Language').fill(languageName)
    await this.page
      .getByRole('option', { name: languageName, exact: true })
      .click()
    await dialog.getByRole('button', { name: 'Create', exact: true }).click()
  }

  async verifyEditorOpenedOnLandingPage(title: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/campaigns\/[^/]+$/)
    await expect(this.page.getByTestId('CampaignTopBar')).toContainText(title)
    await expect(this.page.getByRole('combobox', { name: 'Page' })).toHaveText(
      'Landing page'
    )
    await expect(
      this.page.getByText(
        'Click any text to edit it. Add your regions in the region switcher.'
      )
    ).toBeVisible()
    await expect(
      this.canvas.getByRole('heading', { level: 1, name: DEFAULT_HERO_TITLE })
    ).toBeVisible()
  }

  async editHeroTitle(heroTitle: string): Promise<void> {
    await this.canvas
      .getByRole('heading', { level: 1, name: DEFAULT_HERO_TITLE })
      .click()
    await expect(this.heroTitleInput).toHaveValue(DEFAULT_HERO_TITLE)
    await this.heroTitleInput.fill(heroTitle)
    await expect(this.heroTitleInput).toHaveValue(heroTitle)
  }

  async undo(): Promise<void> {
    const undoButton = this.page.getByRole('button', { name: 'Undo' })
    await expect(undoButton).toBeEnabled()
    await undoButton.click()
  }

  async redo(): Promise<void> {
    const redoButton = this.page.getByRole('button', { name: 'Redo' })
    await expect(redoButton).toBeEnabled()
    await redoButton.click()
  }

  async addRegionFromSwitcher(): Promise<void> {
    await this.canvas.getByRole('button', { name: 'Add', exact: true }).click()
    await expect(this.canvas.getByText(NEW_REGION_NAME)).toBeVisible()
  }

  async openRegionPage(): Promise<void> {
    await this.page.getByRole('combobox', { name: 'Page' }).click()
    await this.page
      .getByRole('option', { name: new RegExp(`^${NEW_REGION_NAME}`) })
      .click()
    await expect(
      this.canvas.getByRole('heading', { name: 'Share this journey' })
    ).toBeVisible()
  }

  /**
   * Links a published journey to the region's default Share Language by
   * pasting its public address, then returns the Share Link the editor shows
   * for it (without its scheme).
   */
  async linkJourneyToDefaultShareLanguage(journeyUrl: string): Promise<string> {
    await this.canvas.getByRole('button', { name: 'Pick a journey' }).click()
    const journeyLink = this.canvas.getByRole('textbox', {
      name: 'Journey link'
    })
    await journeyLink.fill(journeyUrl)
    await journeyLink.press('Enter')
    // 90s: the pasted link is resolved through the public journey query on a cold API
    await this.canvas
      .getByRole('button', { name: 'Use this journey' })
      .click({ timeout: 90000 })

    const shortLink = this.canvas.getByTestId('ShareLanguageShortLink')
    await expect(shortLink).toBeVisible()
    await expect(this.canvas.getByTestId('QrCodeCanvas')).toBeVisible()
    return (await shortLink.innerText()).trim()
  }

  async publish(): Promise<void> {
    await this.page
      .getByRole('button', { name: 'Publish', exact: true })
      .click()
    await expect(this.page.getByTestId('CampaignStatusChip')).toHaveText(
      'Published'
    )
    await expect(
      this.page.getByRole('button', { name: 'Unpublish', exact: true })
    ).toBeVisible()
  }

  /** The campaign's slug, read from the Open page address `/campaign/<slug>`. */
  async getCampaignSlug(): Promise<string> {
    const href = await this.page
      .getByRole('link', { name: 'Open page' })
      .getAttribute('href')
    const slug = href?.match(/\/campaign\/([^/?#]+)/)?.[1]
    if (slug == null) throw new Error(`No campaign slug in Open page: ${href}`)
    return slug
  }
}
