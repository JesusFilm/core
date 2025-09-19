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
