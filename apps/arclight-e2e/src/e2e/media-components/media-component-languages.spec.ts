import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/media-component-utils'
import testData from '../../utils/testData.json'

test('compare media component languages between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const mediaComponentId = testData.mediaComponentId

  const queryParams = new URLSearchParams({
    apiKey: testData.apiKey,
    mediaComponentId: mediaComponentId
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(
      `${baseUrl}/v2/media-components/${mediaComponentId}/languages?${queryParams}`
    ),
    request.get(
      `${compareUrl}/v2/media-components/${mediaComponentId}/languages?${queryParams}`
    )
  ])

  expect(baseResponse.ok()).toBeTruthy()
  expect(compareResponse.ok()).toBeTruthy()

  if (baseResponse.ok() && compareResponse.ok()) {
    const baseData = await baseResponse.json()
    const compareData = await compareResponse.json()

    const baseLanguages = baseData._embedded.mediaComponentLanguage
    const compareLanguages = compareData._embedded.mediaComponentLanguage

    for (const language of baseLanguages) {
      delete language._links
      delete language.downloadUrls
      delete language.shareUrl
    }

    for (const language of compareLanguages) {
      delete language._links
      delete language.downloadUrls
      delete language.shareUrl
    }

    const baseLanguageMap = convertArrayToObject(baseLanguages, 'languageId')
    const compareLanguageMap = convertArrayToObject(
      compareLanguages,
      'languageId'
    )

    const differences = getObjectDiff(baseLanguageMap, compareLanguageMap)

    for (const diffId of differences) {
      if (!baseLanguageMap[diffId]) {
        console.log(`Language ${diffId} only exists in compare environment`)
      } else if (!compareLanguageMap[diffId]) {
        console.log(`Language ${diffId} only exists in base environment`)
      } else {
        const specificDiffs = getObjectDiff(
          baseLanguageMap[diffId],
          compareLanguageMap[diffId]
        )
        console.log(`Differences in language ${diffId}:`, specificDiffs)
      }
    }

    expect(differences).toHaveLength(0)
  }
})
