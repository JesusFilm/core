import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import { getObjectDiff } from '../../utils/comparison-utils'
import { apiKey } from '../../utils/testData.json'

test('compare single metadata language tag between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const metadataLanguageTag = 'en'
  const queryParams = new URLSearchParams({
    apiKey
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(
      `${baseUrl}/v2/metadata-language-tags/${metadataLanguageTag}?${queryParams}`
    ),
    request.get(
      `${compareUrl}/v2/metadata-language-tags/${metadataLanguageTag}?${queryParams}`
    )
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseData = await baseResponse.json()
  const compareData = await compareResponse.json()

  const diffs = getObjectDiff(baseData[0], compareData[0])
  expect(
    diffs,
    `Differences found in metadata language tag ${metadataLanguageTag}`
  ).toHaveLength(0)
})
