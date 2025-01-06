import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import { getObjectDiff } from '../../utils/media-component-utils'
import { apiKey, languageId } from '../../utils/testData.json'

test('compare single media language between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const queryParams = new URLSearchParams({
    apiKey,
    metadataLanguageTags: 'en'
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/media-languages/${languageId}?${queryParams}`),
    request.get(`${compareUrl}/v2/media-languages/${languageId}?${queryParams}`)
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseDataJson = await baseResponse.json()
  const compareDataJson = await compareResponse.json()

  delete baseDataJson._links
  delete compareDataJson._links

  const diffs = getObjectDiff(baseDataJson, compareDataJson)
  expect(
    diffs,
    `Differences found in media language ${languageId}`
  ).toHaveLength(0)
})
