import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/media-component-utils'
import { apiKey } from '../../utils/testData.json'

test('compare media country links between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const queryParams = new URLSearchParams({
    apiKey
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/media-country-links?${queryParams}`),
    request.get(`${compareUrl}/v2/media-country-links?${queryParams}`)
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseData = await baseResponse.json()
  const compareData = await compareResponse.json()

  const baseLinks = convertArrayToObject(
    baseData._embedded.mediaCountriesLinks,
    'countryId'
  )
  const compareLinks = convertArrayToObject(
    compareData._embedded.mediaCountriesLinks,
    'countryId'
  )

  const diffs = getObjectDiff(baseLinks, compareLinks)
  expect(diffs, 'Differences found in country language links').toHaveLength(0)
})
