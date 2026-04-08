import { expect } from '@playwright/test'
import type { Locator, Page } from 'playwright-core'

const defaultTimeout = 60000
const maxNavigationClicks = 5

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

  async clickNextButton(): Promise<void> {
    const nextButton = this.page.getByTestId('CustomizeFlowNextButton')
    await expect(nextButton).toBeEnabled({ timeout: defaultTimeout })
    await nextButton.click({ timeout: defaultTimeout })
  }

  async navigateToMediaScreen(): Promise<void> {
    const videosSection = this.page.getByTestId('VideosSection')
    for (let i = 0; i < maxNavigationClicks; i++) {
      if (await videosSection.isVisible()) return
      await this.clickNextButton()
    }
    await expect(videosSection).toBeVisible({ timeout: defaultTimeout })
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
    const input = this.page
      .getByTestId('VideosSection-youtube-input')
      .locator('input')
    await input.fill(url)
    await input.blur()
  }

  async waitForAutoSubmit(): Promise<void> {
    const helperText = this.page
      .getByTestId('VideosSection-youtube-input')
      .locator('.MuiFormHelperText-root')
    await expect(helperText).toBeVisible({ timeout: defaultTimeout })
    await this.page.waitForLoadState('load')
  }

  async waitForAutoSubmitError(): Promise<void> {
    const fieldRoot = this.page.getByTestId('VideosSection-youtube-input')
    const errorHelper = fieldRoot.locator('.MuiFormHelperText-root.Mui-error')
    // 90s: 800ms debounce + journey/context; scope to field — no fragile aria-invalid timing
    await expect(errorHelper).toHaveText('Please enter a valid YouTube URL', {
      timeout: 90000
    })
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
