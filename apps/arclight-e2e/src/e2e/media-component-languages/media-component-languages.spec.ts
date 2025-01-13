import { expect, test } from '@playwright/test'

import {
  cleanStreamingUrls,
  createQueryParams,
  makeParallelRequests
} from '../../framework/helpers'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/comparison-utils'
import { testData } from '../../utils/testData'

test('compare media component languages between environments', async ({
  request
}) => {
  const params = createQueryParams({
    mediaComponentId: testData.mediaComponentId
  })

  const [baseData, compareData] = await makeParallelRequests(
    request,
    `/v2/media-components/${testData.mediaComponentId}/languages`,
    params
  )

  const cleanLanguages = (languages: any[]) => {
    return languages.map((language) => {
      const cleanedLanguage = { ...language }
      delete cleanedLanguage._links
      cleanStreamingUrls(cleanedLanguage)
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
