import { expect, test } from '@playwright/test'

import {
  cleanResponse,
  createQueryParams,
  makeParallelRequests
} from '../../framework/helpers'
import { getObjectDiff } from '../../utils/comparison-utils'
import { testData } from '../../utils/testData'

test('compare single media component between environments', async ({
  request
}) => {
  const params = createQueryParams({
    mediaComponentId: testData.mediaComponentId
  })

  const [baseData, compareData] = await makeParallelRequests(
    request,
    `/v2/media-components/${testData.mediaComponentId}`,
    params
  )

  const baseDataCleaned = cleanResponse(baseData, ['_links'])
  const compareDataCleaned = cleanResponse(compareData, ['_links'])

  const diffs = getObjectDiff(baseDataCleaned, compareDataCleaned)
  expect(
    diffs,
    `Differences found in media component ${testData.mediaComponentId}`
  ).toHaveLength(0)
})
