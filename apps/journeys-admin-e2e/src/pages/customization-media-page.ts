import { expect } from '@playwright/test'
import type { Page } from 'playwright-core'

const defaultTimeout = 60000

export class CustomizationMediaPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async navigateToCustomize(templateId: string): Promise<void> {
    await this.page.goto(
      `/templates/${templateId}/customize?screen=language`,
      { waitUntil: 'networkidle' }
    )
  }

  async clickNextButton(): Promise<void> {
    await this.page
      .getByTestId('CustomizeFlowNextButton')
      .click({ timeout: defaultTimeout })
  }

  async navigateToMediaScreen(): Promise<void> {
    // Language → Text → Media (click Next twice)
    await this.clickNextButton()
    await this.clickNextButton()
    await expect(
      this.page.getByTestId('VideosSection')
    ).toBeVisible({ timeout: defaultTimeout })
  }

  async getVideosSectionLocator() {
    return this.page.getByTestId('VideosSection')
  }

  async getYouTubeInput() {
    return this.page.getByTestId('VideosSection-youtube-input')
  }

  async getYouTubeSetButton() {
    return this.page.getByTestId('VideosSection-youtube-set')
  }

  async getUploadButton() {
    return this.page.getByTestId('VideosSection-upload-button')
  }

  async pasteYouTubeUrl(url: string): Promise<void> {
    const input = this.page
      .getByTestId('VideosSection-youtube-input')
      .locator('input')
    await input.fill(url)
  }

  async clickSetYouTube(): Promise<void> {
    await this.page.getByTestId('VideosSection-youtube-set').click()
  }

  async verifyVideosSectionVisible(): Promise<void> {
    await expect(
      this.page.getByTestId('VideosSection')
    ).toBeVisible({ timeout: defaultTimeout })
  }

  async verifyVideoPreviewVisible(): Promise<void> {
    // After YouTube link is set, either a video player or placeholder should be visible
    await expect(
      this.page.getByTestId('VideosSection').locator('iframe, video')
    ).toBeVisible({ timeout: defaultTimeout })
  }

  async verifyUploadButtonVisible(): Promise<void> {
    await expect(
      this.page.getByTestId('VideosSection-upload-button')
    ).toBeVisible({ timeout: defaultTimeout })
  }

  async verifyYouTubeInputVisible(): Promise<void> {
    await expect(
      this.page.getByTestId('VideosSection-youtube-input')
    ).toBeVisible({ timeout: defaultTimeout })
  }

  async getYouTubeInputValue(): Promise<string> {
    return await this.page
      .getByTestId('VideosSection-youtube-input')
      .locator('input')
      .inputValue()
  }

  async getYouTubeHelperText(): Promise<string | null> {
    return await this.page
      .getByTestId('VideosSection-youtube-input')
      .locator('.MuiFormHelperText-root')
      .textContent()
  }
}
