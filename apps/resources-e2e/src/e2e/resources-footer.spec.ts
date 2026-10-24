import { expect, test } from '@playwright/test'

test('Resources footer images load', async ({ page }) => {
  await page.goto('/resources')

  const footer = page.getByRole('contentinfo')
  await footer.scrollIntoViewIfNeeded()

  for (const name of [
    'Jesus Film logo',
    'X (Twitter)',
    'Facebook',
    'Instagram',
    'YouTube'
  ]) {
    const image = footer.getByRole('img', { name, exact: true })
    await expect(image).toBeVisible()
    await expect(image).toHaveJSProperty('complete', true)
    await expect
      .poll(() =>
        image.evaluate((element: HTMLImageElement) => element.naturalWidth)
      )
      .toBeGreaterThan(0)
  }
})
