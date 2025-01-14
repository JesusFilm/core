import { expect, test } from '@playwright/test'

import {
  createQueryParams,
  makeParallelRequests
} from '../../framework/helpers'
import { getObjectDiff } from '../../utils/comparison-utils'
import { testData } from '../../utils/testData'

test.fixme(
  'compare single media country between environments',
  async ({ request }) => {
    const params = createQueryParams({})

    const [baseData, compareData] = await makeParallelRequests(
      request,
      `/v2/media-countries/${testData.countryId}`,
      params
    )

    // Verify counts structure for base environment
    expect(baseData.counts).toBeDefined()
    expect(baseData.counts.languageCount).toEqual(
      expect.objectContaining({
        value: expect.any(Number),
        description: expect.any(String)
      })
    )
    expect(baseData.counts.languageHavingMediaCount).toEqual(
      expect.objectContaining({
        value: expect.any(Number),
        description: expect.any(String)
      })
    )

    // Remove counts before comparison
    delete baseData.counts
    delete compareData.counts

    const diffs = getObjectDiff(baseData, compareData)
    expect(
      diffs,
      `Differences found in media country ${testData.countryId}`
    ).toHaveLength(0)
  }
)
