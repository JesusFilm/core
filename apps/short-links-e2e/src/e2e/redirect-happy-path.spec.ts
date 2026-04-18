import { expect, test } from '@playwright/test'

const happyPathUrl = process.env.SHORT_LINK_HAPPY_PATH_URL

test('existing short link redirects away from the short-links app', async ({
  page
}) => {
  // Gated on repo secrets / local env — keep skipped until SHORT_LINK_HAPPY_PATH_URL is configured.
  // eslint-disable-next-line playwright/no-skipped-test -- optional secret; see workflow env SHORT_LINK_HAPPY_PATH_URL
  test.skip(
    happyPathUrl == null || happyPathUrl.length === 0,
    'Set SHORT_LINK_HAPPY_PATH_URL to a full URL (e.g. https://host/path) for a known short link in the target environment.'
  )

  const response = await page.goto(happyPathUrl as string)
  expect(response?.status()).toBeLessThan(400)

  const finalUrl = page.url()
  expect(finalUrl).not.toContain('link-does-not-exist')
  await expect(page.getByText("We've Lost This Page")).toHaveCount(0)
})
