import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import { getObjectDiff } from '../../utils/media-component-utils'
import testData from '../../utils/testData.json'

test('compare specific media component languages between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const mediaComponentId = testData.mediaComponentId
  const languageId = testData.languageId

  const queryParams = new URLSearchParams({
    apiKey: testData.apiKey,
    mediaComponentId,
    languageId
  })

  // Fetch responses from both environments
  const [baseResponse, compareResponse] = await Promise.all([
    request.get(
      `${baseUrl}/v2/media-components/${mediaComponentId}/languages/${languageId}?${queryParams}`
    ),
    request.get(
      `${compareUrl}/v2/media-components/${mediaComponentId}/languages/${languageId}?${queryParams}`
    )
  ])

  expect(baseResponse.ok()).toBeTruthy()
  expect(compareResponse.ok()).toBeTruthy()

  if (baseResponse.ok() && compareResponse.ok()) {
    const baseData = await baseResponse.json()
    const compareData = await compareResponse.json()

    // Remove fields that will always be different
    delete baseData.downloadUrls
    delete baseData._links
    delete baseData.shareUrl
    delete baseData.apiSessionId

    delete compareData.downloadUrls
    delete compareData._links
    delete compareData.shareUrl
    delete compareData.apiSessionId

    // Compare the media component languages
    if (!baseData.mediaComponentId) {
      console.log(
        `Media Component Languages for ${mediaComponentId} only exist in compare environment`
      )
      expect(false).toBeTruthy()
    } else if (!compareData.mediaComponentId) {
      console.log(
        `Media Component Languages for ${mediaComponentId} only exist in base environment`
      )
      expect(false).toBeTruthy()
    } else {
      const differences = getObjectDiff(baseData, compareData)

      if (differences.length > 0) {
        console.log('Differences found:', differences)
      }

      expect(differences).toHaveLength(0)
    }
  }
})
