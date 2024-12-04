import { expect, test } from '@playwright/test'

import { getObjectDiff } from '../../../utils/media-component-utils'

test('compare specific media component languages between environments', async ({
  request
}) => {
  const baseUrl = 'http://localhost:4600'
  const compareUrl = 'https://api.arclight.org'
  const apiKey = process.env.API_KEY
  const mediaComponentId = '2_0-ConsideringChristmas'
  const languageId = '529'

  const queryParams = new URLSearchParams({
    apiKey: apiKey || '3a21a65d4gf98hZ7',
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
