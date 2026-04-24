import { expect, test } from '@playwright/test'

test('header: Go to Watch home navigates to the language home route', async ({
  page
}) => {
  // Use a container + language pair that exists in stage/preview data (French is available for this clip).
  await page.goto('/watch/the-savior.html/the-birth-of-jesus/french.html')

  const homeLink = page.getByRole('link', { name: 'Go to Watch home' })
  await expect(homeLink).toBeVisible({ timeout: 90000 })
  await homeLink.scrollIntoViewIfNeeded()
  // 30s: client navigation after hero/video layout can lag behind the link becoming visible
  await Promise.all([
    page.waitForURL(/\/watch\/french\.html(\?|$)/, { timeout: 30000 }),
    homeLink.click()
  ])
})

test('header: audio language dialog shows language selector and can be closed', async ({
  page
}) => {
  await page.goto('/watch')

  await page.getByRole('button', { name: 'select audio language' }).click()

  const languageDialog = page.getByRole('dialog', { name: 'Language Settings' })
  await expect(languageDialog).toBeVisible()

  const languageCombobox = languageDialog.getByRole('combobox').first()
  await expect(languageCombobox).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(languageDialog).toBeHidden()
})

test('hero carousel: swipe advances slides', async ({ page }) => {
  await page.goto('/watch')

  // The horizontal rail uses `VideoCarousel` (Swiper). `ContentHero` is the inline player above it, not the swiper root.
  const carousel = page.getByTestId('VideoCarousel')
  // 90s: Algolia + hero bootstrap on cold preview can exceed the default timeout
  await expect(carousel).toBeVisible({ timeout: 90000 })

  // `data-testid="VideoCarousel"` is on the Swiper root; slide states live in child `.swiper-slide-*` nodes.
  const swiper = carousel
  const box = await swiper.boundingBox()
  expect(box).not.toBeNull()
  const rect = box as NonNullable<typeof box>

  const startX = rect.x + rect.width * 0.75
  const endX = rect.x + rect.width * 0.25
  const y = rect.y + rect.height * 0.5

  await page.mouse.move(startX, y)
  await page.mouse.down()
  await page.mouse.move(endX, y)
  await page.mouse.up()

  await expect(swiper.locator('.swiper-slide-active')).toBeVisible()
})

test('single video: unmute reveals inline controls', async ({ page }) => {
  await page.goto('/watch/the-savior.html/the-birth-of-jesus/english.html')

  const hero = page.getByTestId('ContentHero')
  await expect(hero).toBeVisible({ timeout: 90000 })

  const soundControl = page
    .getByRole('button', { name: 'Play with sound' })
    .or(page.getByRole('button', { name: 'Unmute' }))
  await expect(soundControl).toBeVisible({ timeout: 90000 })
  await soundControl.click()

  const controls = page.getByTestId('vjs-jfp-custom-controls')
  await expect(controls).toBeVisible()
  const playOrPause = controls
    .getByRole('button', { name: 'play' })
    .or(controls.getByRole('button', { name: 'pause' }))
  await expect(playOrPause).toBeVisible()
  await expect(controls.getByTestId('FullscreenButton')).toBeVisible()
})
