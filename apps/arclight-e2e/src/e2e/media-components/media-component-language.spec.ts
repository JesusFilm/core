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

  const [baseData, compareData] = await Promise.all([
    request
      .get(
        `${baseUrl}/v2/media-components/${mediaComponentId}/languages/${languageId}?${queryParams}`
      )
      .then((res) => res.json()),
    request
      .get(
        `${compareUrl}/v2/media-components/${mediaComponentId}/languages/${languageId}?${queryParams}`
      )
      .then((res) => res.json())
  ])

  delete baseData.apiSessionId
  baseData.shareUrl = baseData.shareUrl.split('?')[0]
  baseData.downloadUrls.low.url = baseData.downloadUrls?.low?.url?.split('?')[0]
  baseData.downloadUrls.high.url =
    baseData.downloadUrls?.high?.url?.split('?')[0]
  baseData.streamingUrls.m3u8[0].url =
    baseData.streamingUrls?.m3u8[0]?.url?.split('?')[0]

  delete compareData.apiSessionId
  compareData.shareUrl = compareData.shareUrl.split('?')[0]
  compareData.downloadUrls.low.url =
    compareData.downloadUrls?.low?.url?.split('?')[0]
  compareData.downloadUrls.high.url =
    compareData.downloadUrls?.high?.url?.split('?')[0]
  compareData.streamingUrls.m3u8[0].url =
    compareData.streamingUrls?.m3u8[0]?.url?.split('?')[0]

  const differences = getObjectDiff(baseData, compareData)

  expect(differences).toHaveLength(0)
})
