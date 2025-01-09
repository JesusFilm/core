import { expect, test } from '@playwright/test'

import {
  createQueryParams,
  makeParallelRequests
} from '../../framework/helpers'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/comparison-utils'
import { testData } from '../../utils/testData'

test('compare media country links between environments', async ({
  request
}) => {
  const params = createQueryParams({ ids: testData.countryIds })

  const [baseData, compareData] = await makeParallelRequests(
    request,
    '/v2/media-country-links',
    params
  )

  const baseLinks = convertArrayToObject(
    baseData._embedded.mediaCountriesLinks,
    'countryId'
  )
  const compareLinks = convertArrayToObject(
    compareData._embedded.mediaCountriesLinks,
    'countryId'
  )

  const diffs = getObjectDiff(baseLinks, compareLinks)
  expect(diffs, 'Differences found in country language links').toHaveLength(0)
})
