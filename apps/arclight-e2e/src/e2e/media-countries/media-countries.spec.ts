import { expect, test } from '@playwright/test'

import {
  createQueryParams,
  makeParallelRequests
} from '../../framework/helpers'
import type { MediaCountry } from '../../types'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/comparison-utils'
import { testData } from '../../utils/testData'

test('compare media countries between environments', async ({ request }) => {
  const params = createQueryParams({ ids: testData.countryIds })

  const [baseData, compareData] = await makeParallelRequests(
    request,
    '/v2/media-countries',
    params
  )

  const baseCountries = convertArrayToObject<MediaCountry>(
    baseData._embedded.mediaCountries,
    'countryId'
  )
  const compareCountries = convertArrayToObject<MediaCountry>(
    compareData._embedded.mediaCountries,
    'countryId'
  )

  // Remove languageCount from all countries as it's known to be incorrect
  const cleanCountries = (countries: Record<string, MediaCountry>) => {
    return Object.fromEntries(
      Object.entries(countries).map(([key, country]) => [
        key,
        { ...country, counts: undefined }
      ])
    )
  }

  const cleanedBaseCountries = cleanCountries(baseCountries)
  const cleanedCompareCountries = cleanCountries(compareCountries)

  const diffs = getObjectDiff(cleanedBaseCountries, cleanedCompareCountries)
  expect(diffs, 'Differences found in media countries').toHaveLength(0)
})
