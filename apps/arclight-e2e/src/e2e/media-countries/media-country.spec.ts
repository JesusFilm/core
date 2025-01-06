import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import { getObjectDiff } from '../../utils/media-component-utils'
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

  const diffs = getObjectDiff(baseDataJson, compareDataJson)
  expect(diffs, `Differences found in media country ${countryId}`).toHaveLength(
    0
  )
})
