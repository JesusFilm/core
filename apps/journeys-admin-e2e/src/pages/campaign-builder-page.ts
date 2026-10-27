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
    await this.page.goto('/?type=campaigns')
    await expect(
      this.page.getByRole('tab', { name: /Campaigns$/ })
    ).toHaveAttribute('aria-selected', 'true')
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
    await expect(this.page.getByRole('heading', { name: title })).toBeVisible()
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
    await expect(heroRow).toHaveAttribute('aria-checked', 'true')
  }

  /** Sets the selected section's Background kind on the Inspector's Style tab. */
  async setBackgroundKind(kind: string): Promise<void> {
    await this.inspectorTabs.getByRole('tab', { name: 'Style' }).click()
    await this.page
      .getByRole('tablist', { name: 'Style', exact: true })
      .getByRole('tab', { name: 'Background' })
      .click()
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
    // The title shows optimistically and its write is debounced, and no UI
    // signal reports that it was saved, so wait for the request itself:
    // publishing or deleting before it lands would race the save.
    const titleSaved = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        (response.request().postData() ?? '').includes(
          'CampaignRichTextBlockUpdateText'
        ) &&
        response.ok()
    )
    await titleInput.fill(title)
    await expect(titleInput).toHaveValue(title)
    await titleInput.blur()
    await titleSaved
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

    // The Share Link is the target of the link that opens it
    const openShareLink = this.canvas.getByRole('link', {
      name: 'Open',
      exact: true
    })
    await expect(openShareLink).toBeVisible()
    await expect(this.canvas.getByTitle('QR Code')).toBeVisible()
    const shareLink = await openShareLink.getAttribute('href')
    if (shareLink == null) throw new Error('The Open link has no Share Link')
    return shareLink.replace(/^https?:\/\//, '')
  }

  async publish(): Promise<void> {
    await this.page.getByRole('button', { name: 'Publish status' }).click()
    await this.page
      .getByRole('button', { name: 'Publish', exact: true })
      .click()
    await expect(
      this.page.getByRole('button', { name: 'Unpublish', exact: true })
    ).toBeVisible()
    await this.page.keyboard.press('Escape')
  }

  /**
   * The campaign's slug, read from the `slug` query parameter of the Refresh
   * and open page address `/api/campaign/open?id=…&slug=…`.
   */
  async getCampaignSlug(): Promise<string> {
    await this.page.getByRole('button', { name: 'Publish status' }).click()
    const href = await this.page
      .getByRole('link', { name: 'Refresh and open page', exact: true })
      .getAttribute('href')
    await this.page.keyboard.press('Escape')
    const slug =
      href == null
        ? null
        : new URL(href, 'http://localhost').searchParams.get('slug')
    if (slug == null || slug === '')
      throw new Error(`No slug parameter in Refresh and open page: ${href}`)
    return slug
  }

  /**
   * Deletes the campaign open in the editor from its Settings, so a run
   * leaves nothing behind. Returns false, without deleting, when the run
   * never got as far as an editor.
   */
  async deleteCampaign(): Promise<boolean> {
    if (!/^\/campaigns\/[^/]+$/.test(new URL(this.page.url()).pathname)) {
      return false
    }

    // Reloading starts the editor with nothing selected, so Settings shows
    // the campaign itself, and it drops any popover (a modal with a backdrop)
    // a test that died mid-step left open. Escape cannot do either safely: with
    // no popover open it steps the editor selection up instead.
    await this.page.reload()

    const settingsTab = this.inspectorTabs.getByRole('tab', {
      name: 'Settings'
    })
    await settingsTab.click()
    await expect(settingsTab).toHaveAttribute('aria-selected', 'true')
    await this.page.getByRole('button', { name: 'Delete campaign' }).click()
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete', exact: true })
      .click()
    await expect(this.page).toHaveURL(/\/\?type=campaigns$/)
    return true
  }
}
