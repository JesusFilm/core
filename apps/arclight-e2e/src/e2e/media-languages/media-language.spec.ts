import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import testData from '../../utils/testData.json'

test.fixme(
  'compare single media language between environments',
  async ({ request }) => {
    const baseUrl = await getBaseUrl()
    const testLanguageId = testData.languageIds?.[0]

    const queryParams = new URLSearchParams({
      apiKey: testData.apiKey
    })

    const [baseData, compareData] = await Promise.all([
      request
        .get(`${baseUrl}/v2/media-languages/${testLanguageId}?${queryParams}`)
        .then((res) => res.json()),
      request
        .get(
          `https://api.arclight.org/v2/media-languages/${testLanguageId}?${queryParams}`
        )
        .then((res) => res.json())
    ])

    // Compare core fields
    expect(baseData.languageId).toBe(compareData.languageId)
    expect(baseData.iso3).toBe(compareData.iso3)
    expect(baseData.bcp47).toBe(compareData.bcp47)
    expect(baseData.name).toBe(compareData.name)
    expect(baseData.counts).toEqual(compareData.counts)
  }
)

test('verify 404 for non-existent language', async ({ request }) => {
  const baseUrl = await getBaseUrl()
  const queryParams = new URLSearchParams({
    apiKey: testData.apiKey
  })

  const response = await request.get(
    `${baseUrl}/v2/media-languages/999999?${queryParams}`
  )
  expect(response.status()).toBe(404)
})
