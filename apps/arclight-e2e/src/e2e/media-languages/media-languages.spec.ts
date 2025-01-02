import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/media-component-utils'
import { apiKey, mediaLanguages } from '../../utils/testData.json'

test('compare media languages between environments', async ({ request }) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const queryParams = new URLSearchParams({
    apiKey,
    ids: mediaLanguages.join(',')
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/media-languages?${queryParams}`),
    request.get(`${compareUrl}/v2/media-languages?${queryParams}`)
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseData = await baseResponse.json()
  const compareData = await compareResponse.json()

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
