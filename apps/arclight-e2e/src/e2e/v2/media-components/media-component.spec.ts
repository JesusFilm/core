import { expect, test } from '@playwright/test'

import { getObjectDiff } from '../../../utils/media-component-utils'

test('compare single media component between environments', async ({
  request
}) => {
  // Configuration
  const baseUrl = 'http://localhost:4600'
  const compareUrl = 'https://api.arclight.org'
  const apiKey = process.env.API_KEY
  const mediaComponentId = '1_jf-0-0'

  // Construct query parameters
  const queryParams = new URLSearchParams({
    apiKey: apiKey || '3a21a65d4gf98hZ7',
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
