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

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(
      `${baseUrl}/v2/media-components/${testData.mediaComponentId}?${queryParams}`
    ),
    request.get(
      `${compareUrl}/v2/media-components/${testData.mediaComponentId}?${queryParams}`
    )
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseDataJson = await baseResponse.json()
  const compareDataJson = await compareResponse.json()

  delete baseDataJson._links
  delete compareDataJson._links

  const diffs = getObjectDiff(baseDataJson, compareDataJson)

  expect(
    diffs,
    `Differences found in media component ${testData.mediaComponentId}`
  ).toHaveLength(0)
})
