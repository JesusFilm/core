import { expect, Page } from '@playwright/test'

const DEFAULT_VIDEO_SLUG = 'city-runner'

export async function navigateToCropper(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Vertical Crop Studio' })).toBeVisible()
}

export function getVideoListItem(page: Page, slug: string) {
  return page.getByRole('listitem').filter({ hasText: `slug: ${slug}` })
}

export async function waitForVideoCatalog(page: Page) {
  const firstItem = page.getByRole('listitem').first()
  await expect(firstItem).toBeVisible()
}

export async function selectVideo(page: Page, slug: string = DEFAULT_VIDEO_SLUG) {
  const listItem = getVideoListItem(page, slug)
  await expect(listItem).toBeVisible()
  const loadButton = listItem.getByRole('button')
  await loadButton.click()
  await expect(loadButton).toHaveText('Selected')
  await expect(page.locator('text=Select a video to begin.')).toHaveCount(0)
}

export function timelineKeyframes(page: Page) {
  return page.getByRole('button', { name: /Keyframe at/ })
}

export async function setTimelinePosition(page: Page, seconds: number) {
  const slider = page.getByLabel('Timeline')
  await expect(slider).toBeEnabled()
  await slider.fill(String(seconds))
}

export async function startPreprocessing(page: Page, quality: 'fast' | 'standard' | 'high' = 'standard') {
  const preprocessButton = page.getByRole('button', { name: /⚡ Preprocess/i })
  await expect(preprocessButton).toBeVisible()
  await preprocessButton.click()

  // Wait for dialog to open
  const qualitySelect = page.getByLabel('Quality')
  await expect(qualitySelect).toBeVisible()

  // Select quality
  await qualitySelect.selectOption(quality)

  // Start preprocessing
  const startButton = page.getByRole('button', { name: /Start Preprocessing/i })
  await expect(startButton).toBeVisible()
  await startButton.click()
}

export async function waitForPreprocessingComplete(page: Page, timeout: number = 60000) {
  // Wait for progress indicator to show completion
  await expect(page.getByText(/100%/)).toBeVisible({ timeout })

  // Wait for "Preprocessed" indicator to appear
  await expect(page.getByText('Preprocessed')).toBeVisible({ timeout: 10000 })
}

export async function playVideo(page: Page) {
  const playButton = page.getByRole('button', { name: /Play|▶️/i })
  await expect(playButton).toBeVisible()
  await playButton.click()

  // Wait for video to start playing (play button should become pause button)
  await expect(page.getByRole('button', { name: /Pause|⏸️/i })).toBeVisible({ timeout: 5000 })
}

export async function pauseVideo(page: Page) {
  const pauseButton = page.getByRole('button', { name: /Pause|⏸️/i })
  await expect(pauseButton).toBeVisible()
  await pauseButton.click()

  // Wait for video to pause (pause button should become play button)
  await expect(page.getByRole('button', { name: /Play|▶️/i })).toBeVisible({ timeout: 5000 })
}

export async function scrubTimeline(page: Page, percentage: number) {
  const slider = page.getByLabel('Timeline')
  await expect(slider).toBeEnabled()

  // Set value as percentage
  await slider.fill(String(percentage / 100 * 30)) // Assuming 30 second video
}

export async function getCropBoxPosition(page: Page) {
  const cropBox = page.locator('[style*="border: 2px solid rgb(251, 191, 36)"]').first()
  await expect(cropBox).toBeVisible()

  return await cropBox.boundingBox()
}

export async function getYellowBoxPosition(page: Page) {
  // Try multiple selectors for the yellow cropping box
  let yellowBox = page.locator('[style*="border: 2px solid rgb(251, 191, 36)"]').first()

  if (!(await yellowBox.isVisible().catch(() => false))) {
    yellowBox = page.locator('.border-yellow-400').first()
  }

  if (!(await yellowBox.isVisible().catch(() => false))) {
    yellowBox = page.locator('[class*="border-yellow-400"]').first()
  }

  await expect(yellowBox).toBeVisible()

  return await yellowBox.boundingBox()
}

export async function waitForVideoLoad(page: Page) {
  // Wait for video element to be ready
  const video = page.locator('video').first()
  await expect(video).toBeVisible()

  // Wait for video to have loaded metadata
  await page.waitForFunction(() => {
    const video = document.querySelector('video')
    return video && video.readyState >= 1 // HAVE_METADATA
  })
}

export async function getVideoCurrentTime(page: Page): Promise<number> {
  const timeDisplay = page.locator('.vjs-current-time-display')
  const timeText = await timeDisplay.textContent()
  if (!timeText) return 0

  // Parse time like "1:23" to seconds
  const parts = timeText.split(':').map(Number)
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return parts[0] || 0
}

export async function waitForYellowBoxMovement(page: Page, initialPosition: any, timeout: number = 5000) {
  return await page.waitForFunction(
    (initial) => {
      const yellowBox = document.querySelector('[style*="border: 2px solid rgb(251, 191, 36)"]') ||
                       document.querySelector('.border-yellow-400') ||
                       document.querySelector('[class*="border-yellow-400"]')
      if (!yellowBox) return false

      const rect = yellowBox.getBoundingClientRect()
      return rect.left !== initial.left || rect.top !== initial.top
    },
    initialPosition,
    { timeout }
  )
}
