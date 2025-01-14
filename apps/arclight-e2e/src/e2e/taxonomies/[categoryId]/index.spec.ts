import { expect, test } from '@playwright/test'

import {
  createQueryParams,
  makeParallelRequests
} from '../../../framework/helpers'
import { getTaxonomyDiff } from '../../../utils/comparison-utils'

test.fixme(
  'compare single taxonomy category between environments',
  async ({ request }) => {
    const category = 'types'
    const params = createQueryParams({ metadataLanguageTags: 'en' })

    const [baseData, compareData] = await makeParallelRequests(
      request,
      `/v2/taxonomies/${category}`,
      params
    )

    const diffs = getTaxonomyDiff(baseData, compareData)
    expect(
      diffs,
      `Differences found in taxonomy category ${category}`
    ).toHaveLength(0)
  }
)
