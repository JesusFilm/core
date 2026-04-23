import { expect, test } from '@playwright/test'

test('home directory opens a second featured journey', async ({ page }) => {
  await page.goto('/home')

  const journeyLinks = page.locator('a[href^="/"]')
  await expect(journeyLinks.first()).toBeVisible()

  const slugHrefs = await journeyLinks.evaluateAll((anchors) => {
    const hrefs = anchors
      .map((anchor) => anchor.getAttribute('href'))
      .filter((href): href is string => href != null && href.startsWith('/'))
      .filter((href) => href.split('/').filter(Boolean).length === 1)
      .filter((href) => href !== '/fact-or-fiction')

    return [...new Set(hrefs)]
  })

  expect(
    slugHrefs.length,
    'Expected /home to list at least one featured journey other than /fact-or-fiction'
  ).toBeGreaterThan(0)

  const slugHref = slugHrefs[0]
  await page.locator(`a[href="${slugHref}"]`).click()
  await expect(page).toHaveURL(new RegExp(slugHref.replace('/', '\\/')))

  await expect(page.getByRole('main')).toBeVisible()
})
