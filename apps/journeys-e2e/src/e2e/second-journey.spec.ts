import { expect, test } from '@playwright/test'

test('featured journey grid opens a catalog journey', async ({ page }) => {
  // `/` is the featured-journeys grid on the root domain. On Vercel preview hosts,
  // `/home` is rewritten to `[hostname]/home` and becomes a 404 — see journeys/middleware.ts.
  await page.goto('/')

  const journeyLinks = page.locator('a[href^="/"]')
  // 90s: cold Vercel SSR + Apollo for the journeys grid
  await expect(journeyLinks.first()).toBeVisible({ timeout: 90000 })

  const slugHrefs = await journeyLinks.evaluateAll((anchors) => {
    const hrefs = anchors
      .map((anchor) => anchor.getAttribute('href'))
      .filter((href): href is string => href != null && href.startsWith('/'))
      .filter((href) => href.split('/').filter(Boolean).length === 1)

    return [...new Set(hrefs)]
  })

  expect(
    slugHrefs.length,
    'Expected the featured grid to expose at least one journey slug link'
  ).toBeGreaterThan(0)

  const preferred = slugHrefs.filter((href) => href !== '/fact-or-fiction')
  const slugHref = preferred[0] ?? slugHrefs[0]
  await page.locator(`a[href="${slugHref}"]`).click()
  await expect(page).toHaveURL(new RegExp(slugHref.replace('/', '\\/')))

  // Journey steps use a video region + step headings; there is no document `<main>` landmark.
  await expect(page.getByRole('region', { name: 'Video Player' })).toBeVisible({
    timeout: 90000
  })
})
