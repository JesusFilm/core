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
    request
      .get(
        `${baseUrl}/v2/media-components/${testData.mediaComponentId}?${queryParams}`
      )
      .then((res) => res.json()),
    request
      .get(
        `${compareUrl}/v2/media-components/${testData.mediaComponentId}?${queryParams}`
      )
      .then((res) => res.json())
  ])

  delete baseData._links
  delete compareData._links

  const diffs = getObjectDiff(baseData, compareData)

  expect(
    diffs,
    `Differences found in media component ${testData.mediaComponentId}`
  ).toHaveLength(0)
})
