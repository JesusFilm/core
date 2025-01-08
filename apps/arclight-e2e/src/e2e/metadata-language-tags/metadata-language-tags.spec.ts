import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/comparison-utils'
import { apiKey } from '../../utils/testData.json'

interface Diff {
  path: string
  base: any
  compare: any
}

test('compare metadata language tags between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const queryParams = new URLSearchParams({ apiKey })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/metadata-language-tags?${queryParams}`),
    request.get(`${compareUrl}/v2/metadata-language-tags?${queryParams}`)
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseData = await baseResponse.json()
  const compareData = await compareResponse.json()

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
