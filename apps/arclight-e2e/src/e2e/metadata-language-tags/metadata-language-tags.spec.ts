import { expect, test } from '@playwright/test'

import {
  createQueryParams,
  makeParallelRequests
} from '../../framework/helpers'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/comparison-utils'

test('compare metadata language tags between environments', async ({
  request
}) => {
  const params = createQueryParams({})

  const [baseData, compareData] = await makeParallelRequests(
    request,
    '/v2/metadata-language-tags',
    params
  )

  const baseLanguageTags = convertArrayToObject(
    baseData._embedded.metadataLanguageTags,
    'tag'
  )
  const compareLanguageTags = convertArrayToObject(
    compareData._embedded.metadataLanguageTags,
    'tag'
  )

  const diffs = getObjectDiff(baseLanguageTags, compareLanguageTags)
  expect(diffs, 'Differences found in metadata language tags').toHaveLength(0)
})
