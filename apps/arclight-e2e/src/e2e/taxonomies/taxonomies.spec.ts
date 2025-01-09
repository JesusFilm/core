import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import { getTaxonomyDiff } from '../../utils/comparison-utils'
import { apiKey } from '../../utils/testData.json'

test('compare taxonomies between environments', async ({ request }) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'

  const queryParams = new URLSearchParams({
    apiKey,
    metadataLanguageTags: 'en'
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/taxonomies?${queryParams}`),
    request.get(`${compareUrl}/v2/taxonomies?${queryParams}`)
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseData = await baseResponse.json()
  const compareData = await compareResponse.json()

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
