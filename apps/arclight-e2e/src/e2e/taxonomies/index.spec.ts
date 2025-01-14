import { expect, test } from '@playwright/test'

import {
  createQueryParams,
  makeParallelRequests
} from '../../framework/helpers'
import { getTaxonomyDiff } from '../../utils/comparison-utils'

test.fixme('compare taxonomies between environments', async ({ request }) => {
  const params = createQueryParams({ metadataLanguageTags: 'en' })

  const [baseData, compareData] = await makeParallelRequests(
    request,
    '/v2/taxonomies',
    params
  )

  // Sort terms within each taxonomy before comparison
  Object.keys(baseData._embedded.taxonomies).forEach((key) => {
    const terms = baseData._embedded.taxonomies[key].terms
    const sortedTerms = Object.fromEntries(
      Object.entries(terms).sort(([a], [b]) => a.localeCompare(b))
    )
    baseData._embedded.taxonomies[key].terms = sortedTerms
  })

  Object.keys(compareData._embedded.taxonomies).forEach((key) => {
    const terms = compareData._embedded.taxonomies[key].terms
    const sortedTerms = Object.fromEntries(
      Object.entries(terms).sort(([a], [b]) => a.localeCompare(b))
    )
    compareData._embedded.taxonomies[key].terms = sortedTerms
  })

  const diffs = getTaxonomyDiff(
    baseData._embedded.taxonomies,
    compareData._embedded.taxonomies
  )
  expect(diffs, 'Differences found in taxonomies').toHaveLength(0)
})
