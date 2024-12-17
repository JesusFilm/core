import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import { getObjectDiff } from '../../utils/media-component-utils'
import testData from '../../utils/testData.json'

test('compare specific media component languages between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const { mediaComponentId, languageId, apiKey } = testData

  const queryParams = new URLSearchParams({
    apiKey,
    mediaComponentId,
    languageId
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(
      `${baseUrl}/v2/media-components/${mediaComponentId}/languages/${languageId}?${queryParams}`
    ),
    request.get(
      `${compareUrl}/v2/media-components/${mediaComponentId}/languages/${languageId}?${queryParams}`
    )
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseData = await baseResponse.json()
  const compareData = await compareResponse.json()

  // Clean up dynamic data from both responses
  const cleanResponse = (data: any) => {
    delete data.apiSessionId
    data.shareUrl = data.shareUrl?.split('?')[0]
    data.downloadUrls.low.url = data.downloadUrls?.low?.url?.split('?')[0]
    data.downloadUrls.high.url = data.downloadUrls?.high?.url?.split('?')[0]
    data.streamingUrls.m3u8[0].url =
      data.streamingUrls?.m3u8[0]?.url?.split('?')[0]
    return data
  }

  const cleanedBaseData = cleanResponse(baseData)
  const cleanedCompareData = cleanResponse(compareData)

  const differences = getObjectDiff(cleanedBaseData, cleanedCompareData)

  expect(differences).toHaveLength(0)
})
