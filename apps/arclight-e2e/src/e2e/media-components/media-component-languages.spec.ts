import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/comparison-utils'
import { apiKey, mediaComponentId } from '../../utils/testData.json'

test('compare media component languages between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'

  const queryParams = new URLSearchParams({
    apiKey,
    mediaComponentId
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(
      `${baseUrl}/v2/media-components/${mediaComponentId}/languages?${queryParams}`
    ),
    request.get(
      `${compareUrl}/v2/media-components/${mediaComponentId}/languages?${queryParams}`
    )
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseData = await baseResponse.json()
  const compareData = await compareResponse.json()

  const cleanLanguages = (languages: any[]) => {
    return languages.map((language) => {
      const cleanedLanguage = { ...language }
      delete cleanedLanguage._links
      cleanedLanguage.streamingUrls =
        cleanedLanguage.streamingUrls.m3u8[0].url.split('?')[0]
      return cleanedLanguage
    })
  }

  const baseLanguages = cleanLanguages(
    baseData._embedded.mediaComponentLanguage
  )
  const compareLanguages = cleanLanguages(
    compareData._embedded.mediaComponentLanguage
  )

  const baseLanguageMap = convertArrayToObject(baseLanguages, 'languageId')
  const compareLanguageMap = convertArrayToObject(
    compareLanguages,
    'languageId'
  )

  const diffs = getObjectDiff(baseLanguageMap, compareLanguageMap)

  expect(diffs).toHaveLength(0)
})
