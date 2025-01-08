import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import { getObjectDiff } from '../../utils/media-component-utils'
import { apiKey, languageId } from '../../utils/testData.json'

test('compare single media language between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const queryParams = new URLSearchParams({
    apiKey
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/media-languages/${languageId}?${queryParams}`),
    request.get(`${compareUrl}/v2/media-languages/${languageId}?${queryParams}`)
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseDataJson = await baseResponse.json()
  const compareDataJson = await compareResponse.json()

  // Verify counts structure for base environment
  expect(baseDataJson.counts).toEqual(
    expect.objectContaining({
      speakerCount: expect.objectContaining({
        value: expect.any(Number),
        description: expect.any(String)
      }),
      countriesCount: expect.objectContaining({
        value: expect.any(Number),
        description: expect.any(String)
      }),
      series: expect.objectContaining({
        value: expect.any(Number),
        description: expect.any(String)
      }),
      featureFilm: expect.objectContaining({
        value: expect.any(Number),
        description: expect.any(String)
      }),
      shortFilm: expect.objectContaining({
        value: expect.any(Number),
        description: expect.any(String)
      })
    })
  )

  // Remove counts and links before comparison
  delete baseDataJson.counts
  delete compareDataJson.counts

  const diffs = getObjectDiff(baseDataJson, compareDataJson)
  expect(
    diffs,
    `Differences found in media language ${languageId}`
  ).toHaveLength(0)
})
