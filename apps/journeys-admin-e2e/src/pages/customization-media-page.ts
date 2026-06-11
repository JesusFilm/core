import { expect } from '@playwright/test'
import type { Locator, Page } from 'playwright-core'

const defaultTimeout = 60000

export class CustomizationMediaPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async navigateToCustomize(templateId: string): Promise<void> {
    await this.page.goto(`/templates/${templateId}/customize?screen=language`, {
      waitUntil: 'load'
    })
  }

  /**
   * Jumps to the Media step via `?screen=media`. Do not simulate repeated Next clicks:
   * `VideosSection` visibility can flicker during transitions, causing an extra Next and
   * navigating past Media before the test fills the YouTube field.
   */
  async navigateToMediaScreen(templateId: string): Promise<void> {
    await this.page.goto(`/templates/${templateId}/customize?screen=media`, {
      waitUntil: 'load'
    })
    await expect(this.page.getByTestId('VideosSection')).toBeVisible({
      timeout: defaultTimeout
    })
  }

  getVideosSectionLocator(): Locator {
    return this.page.getByTestId('VideosSection')
  }

  getYouTubeInput(): Locator {
    return this.page.getByTestId('VideosSection-youtube-input')
  }

  getUploadButton(): Locator {
    return this.page.getByTestId('VideosSection-upload-button')
  }

  async pasteYouTubeUrl(url: string): Promise<void> {
    const input = this.page.getByRole('textbox', { name: 'YouTube URL' })
    // VideosSection disables this field while upload/processing; filling while disabled skips debounced validation.
    await expect(input).toBeEnabled({ timeout: defaultTimeout })
    await input.fill(url)
    await expect(input).toHaveValue(url)
  }

  async waitForAutoSubmit(): Promise<void> {
    const helperText = this.page
      .getByTestId('VideosSection-youtube-input')
      .locator('.MuiFormHelperText-root')
    await expect(helperText).toBeVisible({ timeout: defaultTimeout })
    await this.page.waitForLoadState('load')
  }

  async waitForAutoSubmitError(): Promise<void> {
    // App debounces validation by 800ms (VideosSection). Assert user-visible copy — more stable than MUI error classes.
    await expect(
      this.page
        .getByTestId('VideosSection')
        .getByText('Please enter a valid YouTube URL')
    ).toBeVisible({ timeout: 90000 })
  }

  async verifyVideosSectionVisible(): Promise<void> {
    await expect(this.page.getByTestId('VideosSection')).toBeVisible({
      timeout: defaultTimeout
    })
  }

  async verifyVideoPreviewVisible(): Promise<void> {
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
