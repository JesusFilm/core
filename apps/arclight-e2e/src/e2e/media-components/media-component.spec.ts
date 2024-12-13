import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import { getObjectDiff } from '../../utils/media-component-utils'
import testData from '../../utils/testData.json'

test('compare single media component between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const queryParams = new URLSearchParams({
    apiKey: testData.apiKey,
    mediaComponentId: testData.mediaComponentId
  })

  const [baseData, compareData] = await Promise.all([
    request.get(
      `${baseUrl}/v2/media-components/${testData.mediaComponentId}?${queryParams}`
    ),
    request.get(
      `${compareUrl}/v2/media-components/${testData.mediaComponentId}?${queryParams}`
    )
  ])

  expect(baseData.ok).toBe(true)
  expect(compareData.ok).toBe(true)

  const baseDataJson = await baseData.json()
  const compareDataJson = await compareData.json()

  delete baseDataJson._links
  delete compareDataJson._links

  const diffs = getObjectDiff(baseDataJson, compareDataJson)

  expect(
    diffs,
    `Differences found in media component ${testData.mediaComponentId}`
  ).toHaveLength(0)
})
