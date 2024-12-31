/* eslint-disable playwright/no-conditional-in-test */
import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  ApiResponse,
  convertArrayToObject,
  getObjectDiff
} from '../../utils/media-component-utils'
import testData from '../../utils/testData.json'

test('compare media languages between environments', async ({ request }) => {
  const baseUrl = await getBaseUrl()
  const queryParams = new URLSearchParams({
    apiKey: testData.apiKey
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/media-languages?${queryParams}`),
    request.get(`https://api.arclight.org/v2/media-languages?${queryParams}`)
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

  const diffs = getObjectDiff(baseLanguages, compareLanguages).filter(
    (diffId) => {
      const baseLanguage = baseLanguages[diffId]
      const compareLanguage = compareLanguages[diffId]
      return (
        !baseLanguage ||
        !compareLanguage ||
        getObjectDiff(baseLanguage, compareLanguage).length > 0
      )
    }
  )

  expect(diffs).toHaveLength(0)
})
