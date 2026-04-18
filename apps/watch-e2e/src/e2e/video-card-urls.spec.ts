import { expect, test } from '@playwright/test'

/**
 * Regression: VideoCard links must not resolve to empty segments or "undefined"
 * (see prds/watch/e2e-ui-actions.md).
 */
test('visible VideoCard links do not contain undefined or empty path segments', async ({
  page
}) => {
  await page.goto('/watch')

  const visibleVideoCardLinks = page
    .getByRole('link', { name: 'VideoCard' })
    .filter({ visible: true })

  await expect(visibleVideoCardLinks.first()).toBeVisible()

  const badHrefs = await visibleVideoCardLinks.evaluateAll((elements) =>
    elements
      .map((element) => element.getAttribute('href'))
      .filter((href): href is string => href != null)
      .filter(
        (href) =>
          /undefined/i.test(href) ||
          /\/\.html\//.test(href) ||
          /\/\/+/.test(href)
      )
  )

  expect(badHrefs, `Invalid VideoCard hrefs: ${JSON.stringify(badHrefs)}`).toEqual(
    []
  )
})
