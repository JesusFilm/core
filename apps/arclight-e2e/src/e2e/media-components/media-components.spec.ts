import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  ApiResponse,
  convertArrayToObject,
  getObjectDiff
} from '../../utils/media-component-utils'
import testData from '../../utils/testData.json'

test('compare media components between environments', async ({ request }) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'

  const queryParams = new URLSearchParams({
    apiKey: testData.apiKey
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/media-components?${queryParams}`),
    request.get(`${compareUrl}/v2/media-components?${queryParams}`)
  ])

  expect(baseResponse.ok()).toBeTruthy()
  expect(compareResponse.ok()).toBeTruthy()

  if (baseResponse.ok() && compareResponse.ok()) {
    const baseData: ApiResponse = await baseResponse.json()
    const compareData: ApiResponse = await compareResponse.json()

    const baseMediaComponents = convertArrayToObject(
      baseData._embedded.mediaComponents,
      'mediaComponentId'
    )
    const compareMediaComponents = convertArrayToObject(
      compareData._embedded.mediaComponents,
      'mediaComponentId'
    )

    const differences = getObjectDiff(
      baseMediaComponents,
      compareMediaComponents
    )

    for (const diffId of differences) {
      if (!baseMediaComponents[diffId]) {
        console.log(
          `Media Component ${diffId} only exists in compare environment`
        )
      } else if (!compareMediaComponents[diffId]) {
        console.log(`Media Component ${diffId} only exists in base environment`)
      } else {
        const specificDiffs = getObjectDiff(
          baseMediaComponents[diffId],
          compareMediaComponents[diffId]
        )
        console.log(`Differences in ${diffId}:`, specificDiffs)
      }
    }

    expect(differences).toHaveLength(0)
  }
})
