import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/comparison-utils'
import { apiKey, languageIds } from '../../utils/testData.json'

test('compare media languages between environments', async ({ request }) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const queryParams = new URLSearchParams({
    apiKey,
    ids: languageIds.join(',')
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/media-languages?${queryParams}`),
    request.get(`${compareUrl}/v2/media-languages?${queryParams}`)
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseData = await baseResponse.json()
  const compareData = await compareResponse.json()

  // Verify counts structure for base environment
  for (const language of baseData._embedded.mediaLanguages) {
    expect(language.counts).toEqual(
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
    // Remove counts field before comparison
    delete language.counts
  }

  // Remove counts from compare environment
  for (const language of compareData._embedded.mediaLanguages) {
    delete language.counts
  }

  const baseLanguages = convertArrayToObject(
    baseData._embedded.mediaLanguages,
    'languageId'
  )
  const compareLanguages = convertArrayToObject(
    compareData._embedded.mediaLanguages,
    'languageId'
  )

  const diffs = getObjectDiff(baseLanguages, compareLanguages)
  expect(diffs, 'Differences found in media languages').toHaveLength(0)
})
