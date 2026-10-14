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
    await this.togglePagesPanel()
    await expect(this.page.getByTestId('CampaignPagesPanelTitle')).toHaveText(
      title
    )
    await expect(
      this.page.getByRole('button', { name: 'Landing page' })
    ).toHaveAttribute('aria-current', 'page')
    await this.togglePagesPanel()
    await expect(
      this.page.getByText(
        'Pick anything on the page or in the Navigator, then change it in the Inspector.'
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

  /** Opens the Pages panel, or closes it when it is open. */
  private async togglePagesPanel(): Promise<void> {
    await this.page.getByRole('button', { name: 'Pages', exact: true }).click()
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

  /** The Navigator's tree: the open page as exactly what the canvas shows. */
  get navigatorTree(): Locator {
    return this.page.getByRole('tree', { name: 'Page structure' })
  }

  /** The Inspector's Style / Settings tabs (the Style panel has tabs of its own). */
  get inspectorTabs(): Locator {
    return this.page.getByRole('tablist', { name: 'Inspector' })
  }

  /** Opens a Left Rail panel, unless it is already open. */
  private async openRailPanel(name: 'Navigator' | 'Add'): Promise<void> {
    const toggle = this.page.getByRole('button', { name, exact: true })
    if ((await toggle.getAttribute('aria-pressed')) !== 'true') {
      await toggle.click()
    }
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  }

  /** Opens the Navigator and selects the hero's row, which selects it on the canvas too. */
  async selectHeroInNavigator(): Promise<void> {
    await this.openRailPanel('Navigator')
    const heroRow = this.navigatorTree.getByRole('treeitem', { name: /^Hero/ })
    await heroRow.getByText('Hero', { exact: true }).click()
    await expect(heroRow).toHaveAttribute('aria-selected', 'true')
  }

  /** Sets the selected section's Background kind on the Inspector's Style tab. */
  async setBackgroundKind(kind: string): Promise<void> {
    await this.inspectorTabs.getByRole('tab', { name: 'Style' }).click()
    await this.page.getByRole('tab', { name: 'Background' }).click()
    const kindButton = this.page
      .getByRole('group', { name: 'Background' })
      .getByRole('button', { name: kind, exact: true })
    await kindButton.click()
    await expect(kindButton).toHaveAttribute('aria-pressed', 'true')
  }

  /**
   * Adds a Rich text section below the selected section from the Add Panel;
   * the new section is selected, so its Title is typed straight into the
   * canvas.
   */
  async addRichTextSectionBelowSelection(title: string): Promise<void> {
    await this.openRailPanel('Add')
    await this.page
      .getByRole('list', { name: 'Sections' })
      .getByRole('button', { name: 'Rich text', exact: true })
      .click()

    const titleInput = this.canvas.getByRole('textbox', { name: 'Title' })
    await titleInput.fill(title)
    await expect(titleInput).toHaveValue(title)
    await titleInput.blur()
    await expect(
      this.canvas.getByRole('heading', { level: 2, name: title })
    ).toBeVisible()
  }

  async addRegionFromSwitcher(): Promise<void> {
    await this.canvas.getByRole('button', { name: 'Add', exact: true }).click()
    await expect(this.canvas.getByText(NEW_REGION_NAME)).toBeVisible()
  }

  async openRegionPage(): Promise<void> {
    await this.togglePagesPanel()
    await this.page
      .getByRole('button', { name: new RegExp(`^${NEW_REGION_NAME}`) })
      .click()
    await this.togglePagesPanel()
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
    await this.page.getByRole('button', { name: 'Publish status' }).click()
    await this.page
      .getByRole('button', { name: 'Publish', exact: true })
      .click()
    await expect(this.page.getByTestId('PublishStatusDot')).toHaveAttribute(
      'data-status',
      'published'
    )
    await expect(
      this.page.getByRole('button', { name: 'Unpublish', exact: true })
    ).toBeVisible()
    await this.page.keyboard.press('Escape')
  }

  /** The campaign's slug, read from the Open page address `/campaign/<slug>`. */
  async getCampaignSlug(): Promise<string> {
    await this.page.getByRole('button', { name: 'Publish status' }).click()
    const href = await this.page
      .getByRole('link', { name: 'Open page' })
      .getAttribute('href')
    await this.page.keyboard.press('Escape')
    const slug = href?.match(/\/campaign\/([^/?#]+)/)?.[1]
    if (slug == null) throw new Error(`No campaign slug in Open page: ${href}`)
    return slug
  }
}
