import { expect } from '@playwright/test'
import type { Locator, Page } from 'playwright-core'

import { NEW_REGION_NAME } from './campaign-builder-page'

/**
 * The public campaign page on the viewer (journeys app). The admin suite's
 * `baseURL` is the admin, so every address here is absolute: the campaign's
 * public address as the editor shows it.
 */
export class CampaignPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  get openShareLink(): Locator {
    return this.page.getByRole('link', { name: 'Open', exact: true })
  }

  get qrCodeCanvas(): Locator {
    return this.page.getByTitle('QR Code')
  }

  async openLandingPage(address: string, heroTitle: string): Promise<void> {
    // 90s: publish queues an on-demand revalidation, but a not-found cached before it can outlive the revalidate worker's run by up to the 60s ISR window, so reload until the hero shows
    await expect(async () => {
      await this.page.goto(address)
      await expect(
        this.page.getByRole('heading', { level: 1, name: heroTitle })
      ).toBeVisible({ timeout: 5000 })
    }).toPass({ timeout: 90000 })
  }

  /** Like `openLandingPage`, but waits for a section added before the first publish to show. */
  async openLandingPageShowingSection(
    address: string,
    sectionTitle: string
  ): Promise<void> {
    // 90s: publish queues an on-demand revalidation, but a not-found cached before it can outlive the revalidate worker's run by up to the 60s ISR window, so reload until the section shows
    await expect(async () => {
      await this.page.goto(address)
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
    // The <section> is `CampaignSectionBand`'s, and it carries the band
    // background read here. It has no accessible name, so no `region` role to
    // find it by; naming it is a product change, so it is found by its heading.
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

  /** Opens the region page from its switcher card on the landing page at `address`. */
  async openRegionPage(address: string): Promise<void> {
    await this.page
      .getByRole('link', { name: new RegExp(NEW_REGION_NAME) })
      .click()
    const landingPage = new URL(address)
    await expect(this.page).toHaveURL(
      (url) =>
        url.origin === landingPage.origin &&
        new RegExp(`^${landingPage.pathname}/[^/]+$`).test(url.pathname)
    )
    await expect(
      this.page.getByRole('heading', { name: 'Share this journey' })
    ).toBeVisible()
  }

  /** The Share Link the region page offers: the target of the link that opens it. */
  async readShareLink(): Promise<string> {
    await expect(this.openShareLink).toBeVisible()
    const shareLink = await this.openShareLink.getAttribute('href')
    if (shareLink == null) throw new Error('The Open link has no Share Link')
    return shareLink
  }

  /** The Share Link the QR canvas encodes: its `aria-label` is the encoded value. */
  async readQrCodeTarget(): Promise<string> {
    await expect(this.qrCodeCanvas).toBeVisible()
    const target = await this.qrCodeCanvas.getAttribute('aria-label')
    if (target == null) throw new Error('QR canvas has no encoded value')
    return target
  }
}
