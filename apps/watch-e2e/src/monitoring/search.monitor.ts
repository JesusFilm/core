import { expect, test } from '@playwright/test'

/**
 * @check
 * @name Watch Search Monitoring
 * @retries 8
 * @retryInterval 10
 * @maxRetryTime 600
 */

test('Watch Search Monitoring: submitting JESUS returns search results', async ({
  page
}) => {
  const response = await page.goto('https://www.jesusfilm.org/watch')
  expect(response?.status()).toEqual(200)

  await page.getByRole('button', { name: 'Search videos' }).click()

  const searchDialog = page.getByRole('dialog', {
    name: 'Search and browse videos'
  })
  await expect(searchDialog).toBeVisible()

  const searchInput = searchDialog.getByRole('textbox', {
    name: 'Search videos by keyword'
  })
  await searchInput.fill('JESUS')

  const searchResponsePromise = page.waitForResponse((searchResponse) => {
    const request = searchResponse.request()
    const actionUrl = new URL(searchResponse.url())
    const actionPayload = request.postData()

    return (
      request.method() === 'POST' &&
      request.headers()['next-action'] != null &&
      actionUrl.origin === 'https://www.jesusfilm.org' &&
      actionUrl.pathname === '/watch' &&
      actionPayload?.includes('"query":"JESUS"') === true &&
      actionPayload.includes('"surface":"watch-search"')
    )
  })

  await searchInput.press('Enter')

  const searchResponse = await searchResponsePromise
  expect(searchResponse.ok()).toBeTruthy()
  await expect(searchDialog.getByText('JESUS', { exact: true })).toBeVisible()
})
