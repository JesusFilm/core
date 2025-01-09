import { expect, test } from '@playwright/test'

import {
  cleanDownloadUrls,
  cleanShareUrl,
  cleanStreamingUrls,
  createQueryParams,
  makeParallelRequests
} from '../../framework/helpers'
import { getObjectDiff } from '../../utils/comparison-utils'
import { testData } from '../../utils/testData'

test('compare specific media component languages between environments', async ({
  request
}) => {
  const params = createQueryParams({
    mediaComponentId: testData.mediaComponentId,
    languageId: testData.languageId
  })

  const [baseData, compareData] = await makeParallelRequests(
    request,
    `/v2/media-components/${testData.mediaComponentId}/languages/${testData.languageId}`,
    params
  )

  // Clean up dynamic data from both responses
  const cleanResponse = (data: any) => {
    delete data.apiSessionId
    cleanShareUrl(data)
    cleanDownloadUrls(data)
    cleanStreamingUrls(data)
    return data
  }

  const cleanedBaseData = cleanResponse(baseData)
  const cleanedCompareData = cleanResponse(compareData)

  const differences = getObjectDiff(cleanedBaseData, cleanedCompareData)
  expect(differences).toHaveLength(0)
})
