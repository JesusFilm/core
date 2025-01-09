import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/comparison-utils'
import { apiKey, countryIds } from '../../utils/testData.json'

test('compare media countries between environments', async ({ request }) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const queryParams = new URLSearchParams({
    apiKey,
    ids: countryIds.join(',')
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/media-countries?${queryParams}`),
    request.get(`${compareUrl}/v2/media-countries?${queryParams}`)
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseData = await baseResponse.json()
  const compareData = await compareResponse.json()

  const baseCountries = convertArrayToObject(
    baseData._embedded.mediaCountries,
    'countryId'
  )
  const compareCountries = convertArrayToObject(
    compareData._embedded.mediaCountries,
    'countryId'
  )

  // Remove languageCount from all countries as it's known to be incorrect
  Object.values(baseCountries).forEach((country) => {
    if (country.counts?.languageCount) {
      delete country.counts.languageCount
      delete country.counts.languageHavingMediaCount
    }
  })
  Object.values(compareCountries).forEach((country) => {
    if (country.counts?.languageCount) {
      delete country.counts.languageCount
      delete country.counts.languageHavingMediaCount
    }
  })

  const diffs = getObjectDiff(baseCountries, compareCountries)
  expect(diffs, 'Differences found in media countries').toHaveLength(0)
})
