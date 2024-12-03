import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import { getObjectDiff } from '../../utils/media-component-utils'
import testData from '../../utils/testData.json'

test('compare single media component between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const mediaComponentId = testData.mediaComponentId

  const queryParams = new URLSearchParams({
    apiKey: testData.apiKey,
    mediaComponentId: mediaComponentId
  })

  // Fetch responses from both environments
  const [baseResponse, compareResponse] = await Promise.all([
    request.get(
      `${baseUrl}/v2/media-components/${mediaComponentId}?${queryParams}`
    ),
    request.get(
      `${compareUrl}/v2/media-components/${mediaComponentId}?${queryParams}`
    )
  ])

  expect(baseResponse.ok()).toBeTruthy()
  expect(compareResponse.ok()).toBeTruthy()

  if (baseResponse.ok() && compareResponse.ok()) {
    const baseData = await baseResponse.json()
    const compareData = await compareResponse.json()

    delete baseData._links
    delete compareData._links

    if (!baseData.mediaComponentId) {
      console.log(
        `Media Component ${mediaComponentId} only exists in compare environment`
      )
      expect(false).toBeTruthy()
    } else if (!compareData.mediaComponentId) {
      console.log(
        `Media Component ${mediaComponentId} only exists in base environment`
      )
      expect(false).toBeTruthy()
    } else {
      const differences = getObjectDiff(baseData, compareData)

      if (differences.length > 0) {
        console.log(
          `Differences found in media component ${mediaComponentId}:`,
          differences
        )
      }

      expect(differences).toHaveLength(0)
    }
  }
})
