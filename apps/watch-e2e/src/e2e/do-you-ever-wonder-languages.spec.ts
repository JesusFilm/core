import { expect, test } from '@playwright/test'

const reportedLanguages = [
  { name: 'Kurmanji Standard', slug: 'kurmanji-standard' },
  { name: 'Tajik', slug: 'tajik' },
  { name: 'Pashto Eastern Afghan', slug: 'pashto-eastern-afghan' }
]

test('Do You Ever Wonder exposes all eight Children in repaired languages', async ({
  page
}) => {
  for (const language of reportedLanguages) {
    await test.step(language.name, async () => {
      const path = `/watch/do-you-ever-wonder.html/${language.slug}.html`
      const response = await page.goto(path)

      expect(response?.status()).toBeLessThan(400)
      await expect(page).toHaveURL(path)
      await expect(
        page.getByRole('heading', { name: 'Do You Ever Wonder...?' })
      ).toBeVisible()
      await expect(page.getByText(/Collection\s*•\s*8 items/i)).toBeVisible()
      const children = page.getByTestId(
        /^CarouselItem-(?!Title|Image|Category)/
      )
      await expect(children).toHaveCount(8)
      await children.first().click()
      await expect(page).toHaveURL(
        new RegExp(
          `/watch/do-you-ever-wonder\\.html/.+/${language.slug}\\.html`
        )
      )
      await expect(page.locator('video').first()).toBeVisible()
    })
  }
})
