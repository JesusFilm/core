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
    return this.page.getByTestId('QrCodeCanvas').locator('canvas')
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
