import { expect } from '@playwright/test'
import type { Locator, Page } from 'playwright-core'

const defaultTimeout = 60000
const maxNavigationClicks = 5

/** Thrown when the template flow has no media step (flag off or journey has no customizable video). */
export class MediaCustomizeStepUnavailableError extends Error {
  constructor() {
    super(
      'Media customization step is not available (customizableMedia flag off or template has no video blocks)'
    )
    this.name = 'MediaCustomizeStepUnavailableError'
  }
}

function getScreenFromUrl(url: string): string | null {
  try {
    return new URL(url).searchParams.get('screen')
  } catch {
    return null
  }
}

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

      const screen = getScreenFromUrl(this.page.url())
      if (screen === 'social') {
        throw new MediaCustomizeStepUnavailableError()
      }
      if (screen === 'media') {
        await expect(videosSection).toBeVisible({ timeout: defaultTimeout })
        return
      }

      if (!this.page.url().includes('/customize')) break
      const urlBefore = this.page.url()
      await this.clickNextButton()
      await this.page.waitForURL((url) => url.toString() !== urlBefore, {
        timeout: defaultTimeout
      })
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
  }

  async waitForAutoSubmit(): Promise<void> {
    const helperText = this.page
      .getByTestId('VideosSection-youtube-input')
      .locator('p')
    await expect(helperText).toBeVisible({ timeout: defaultTimeout })
    await this.page.waitForLoadState('load')
  }

  async waitForAutoSubmitError(): Promise<void> {
    // Wait for the input to become invalid (aria-invalid is set by MUI on error)
    await expect(
      this.page.getByTestId('VideosSection-youtube-input').locator('input')
    ).toHaveAttribute('aria-invalid', 'true', { timeout: 90000 })
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
      .locator('p')
      .textContent()
  }
}
