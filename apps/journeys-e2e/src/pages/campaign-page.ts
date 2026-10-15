import { expect } from '@playwright/test'
import type { Locator, Page } from 'playwright-core'

export const NEW_REGION_NAME = 'New region'

export class CampaignPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  get copyLinkButton(): Locator {
    return this.page.getByRole('button', { name: 'Copy link', exact: true })
  }

  get qrCodeCanvas(): Locator {
    return this.page.getByTitle('QR Code')
  }

  async openLandingPage(slug: string, heroTitle: string): Promise<void> {
    // 90s: a published page can be served stale until its 60s ISR revalidation, so reload until the hero shows
    await expect(async () => {
      await this.page.goto(`/campaign/${slug}`)
      await expect(
        this.page.getByRole('heading', { level: 1, name: heroTitle })
      ).toBeVisible({ timeout: 5000 })
    }).toPass({ timeout: 90000 })
  }

  /** Like `openLandingPage`, but waits for a section added after the first publish to show. */
  async openLandingPageShowingSection(
    slug: string,
    sectionTitle: string
  ): Promise<void> {
    // 90s: a published page can be served stale until its 60s ISR revalidation, so reload until the new section shows
    await expect(async () => {
      await this.page.goto(`/campaign/${slug}`)
      await expect(this.sectionHeading(sectionTitle)).toBeVisible({
        timeout: 5000
      })
    }).toPass({ timeout: 90000 })
  }

  private sectionHeading(title: string): Locator {
    return this.page.getByRole('heading', { name: title, exact: true })
  }

  /** The section holding the heading paints its band as its background colour. */
  async verifySectionBackground(
    headingTitle: string,
    backgroundColor: string
  ): Promise<void> {
    const section = this.page
      .locator('section')
      .filter({ has: this.sectionHeading(headingTitle) })
    await expect(section).toHaveCSS('background-color', backgroundColor)
  }

  /** The new section's heading sits under the hero's on the page. */
  async verifySectionBelowHero(
    heroTitle: string,
    sectionTitle: string
  ): Promise<void> {
    const heroBox = await this.sectionHeading(heroTitle).boundingBox()
    const sectionBox = await this.sectionHeading(sectionTitle).boundingBox()
    if (heroBox == null || sectionBox == null)
      throw new Error('The hero and the new section must both be on the page')
    expect(sectionBox.y).toBeGreaterThan(heroBox.y)
  }

  async verifyRegionSwitcherCard(): Promise<void> {
    await expect(
      this.page.getByRole('link', { name: new RegExp(NEW_REGION_NAME) })
    ).toBeVisible()
  }

  async openRegionPage(slug: string): Promise<void> {
    await this.page
      .getByRole('link', { name: new RegExp(NEW_REGION_NAME) })
      .click()
    await expect(this.page).toHaveURL(new RegExp(`/campaign/${slug}/[^/]+$`))
    await expect(
      this.page.getByRole('heading', { name: 'Share this journey' })
    ).toBeVisible()
  }

  async readCopiedLink(): Promise<string> {
    await expect(this.copyLinkButton).toBeEnabled()
    await this.copyLinkButton.click()
    await expect(this.page.getByText('Copied')).toBeVisible()
    return await this.page.evaluate(async () => {
      return await navigator.clipboard.readText()
    })
  }

  /** The Share Link the QR canvas encodes: its `aria-label` is the encoded value. */
  async readQrCodeTarget(): Promise<string> {
    await expect(this.qrCodeCanvas).toBeVisible()
    const target = await this.qrCodeCanvas.getAttribute('aria-label')
    if (target == null) throw new Error('QR canvas has no encoded value')
    return target
  }
}
