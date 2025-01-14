import { expect, test } from '@playwright/test'

import {
  createQueryParams,
  makeParallelRequests
} from '../../framework/helpers'
import { getObjectDiff } from '../../utils/comparison-utils'

test.fixme(
  'compare single metadata language tag between environments',
  async ({ request }) => {
    const metadataLanguageTag = 'en'
    const params = createQueryParams({})

    const [baseData, compareData] = await makeParallelRequests(
      request,
      `/v2/metadata-language-tags/${metadataLanguageTag}`,
      params
    )

    const diffs = getObjectDiff(baseData[0], compareData[0])
    expect(
      diffs,
      `Differences found in metadata language tag ${metadataLanguageTag}`
    ).toHaveLength(0)
  }
)
