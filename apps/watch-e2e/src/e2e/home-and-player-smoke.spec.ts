import { expect, test } from '@playwright/test'

test('header: Go to Watch home navigates to the language home route', async ({
  page
}) => {
  await page.goto('/watch/jesus.html/spanish.html')

  await page.getByRole('link', { name: 'Go to Watch home' }).click()
  await expect(page).toHaveURL(/\/watch\/spanish\.html/)
})

test('header: audio language dialog enables language combobox and can be closed', async ({
  page
}) => {
  await page.goto('/watch')

  await page.getByRole('button', { name: 'select audio language' }).click()

  const languageDialog = page.getByRole('dialog', { name: 'Language Settings' })
  await expect(languageDialog).toBeVisible()

  const languageCombobox = languageDialog.getByRole('combobox').first()
  await expect(languageCombobox).toBeEnabled()

  await page.getByRole('button', { name: 'Close' }).click()
  await expect(languageDialog).toBeHidden()
})

test('hero carousel: swipe advances slides', async ({ page }) => {
  await page.goto('/watch')

  const hero = page.getByTestId('ContentHero')
  await expect(hero).toBeVisible()

  const swiper = hero.locator('.swiper')
  await expect(swiper).toBeVisible()

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
  await expect(hero).toBeVisible()

  await page.getByRole('button', { name: 'Unmute' }).click()

  const controls = page.getByTestId('vjs-jfp-custom-controls')
  await expect(controls).toBeVisible()
  await expect(controls.getByRole('button', { name: 'play' })).toBeVisible()
  await expect(controls.getByTestId('FullscreenButton')).toBeVisible()
})
