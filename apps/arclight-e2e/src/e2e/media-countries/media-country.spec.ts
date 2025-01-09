import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import { getObjectDiff } from '../../utils/comparison-utils'
import { apiKey, countryId } from '../../utils/testData.json'

test('compare single media country between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const queryParams = new URLSearchParams({
    apiKey
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/media-countries/${countryId}?${queryParams}`),
    request.get(`${compareUrl}/v2/media-countries/${countryId}?${queryParams}`)
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseDataJson = await baseResponse.json()
  const compareDataJson = await compareResponse.json()

  // Verify counts structure for base environment
  expect(baseDataJson.counts).toEqual(
    expect.objectContaining({
      languageCount: expect.objectContaining({
        value: expect.any(Number),
        description: expect.any(String)
      }),
      languageHavingMediaCount: expect.objectContaining({
        value: expect.any(Number),
        description: expect.any(String)
      })
    })
  )

  // Remove counts before comparison
  delete baseDataJson.counts
  delete compareDataJson.counts

  const diffs = getObjectDiff(baseDataJson, compareDataJson)
  expect(diffs, `Differences found in media country ${countryId}`).toHaveLength(
    0
  )
})
