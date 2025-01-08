import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import { getTaxonomyDiff } from '../../utils/comparison-utils'
import { apiKey } from '../../utils/testData.json'

test('compare single taxonomy category between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const category = 'types'
  const queryParams = new URLSearchParams({
    apiKey,
    metadataLanguageTags: 'en'
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/taxonomies/${category}?${queryParams}`),
    request.get(`${compareUrl}/v2/taxonomies/${category}?${queryParams}`)
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseData = await baseResponse.json()
  const compareData = await compareResponse.json()

  const diffs = getTaxonomyDiff(baseData, compareData)
  expect(
    diffs,
    `Differences found in taxonomy category ${category}`
  ).toHaveLength(0)
})
