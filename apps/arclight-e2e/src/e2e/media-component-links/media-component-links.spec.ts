/* eslint-disable playwright/no-conditional-in-test */
import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  ApiResponse,
  convertArrayToObject,
  getObjectDiff
} from '../../utils/media-component-utils'
import testData from '../../utils/testData.json'

test.skip('compare media component links between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'

  // Construct query parameters
  const queryParams = new URLSearchParams({
    apiKey: testData.apiKey
  })

  // Make parallel API requests
  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/media-component-links?${queryParams}`),
    request.get(`${compareUrl}/v2/media-component-links?${queryParams}`)
  ])

  expect(baseResponse.ok()).toBeTruthy()
  expect(compareResponse.ok()).toBeTruthy()

  if (baseResponse.ok() && compareResponse.ok()) {
    const baseData: ApiResponse = await baseResponse.json()
    const compareData: ApiResponse = await compareResponse.json()

    // Normalize and sort containedBy arrays
    const normalizeData = (data: any) => {
      if (data._embedded?.mediaComponentsLinks) {
        data._embedded.mediaComponentsLinks.forEach((link: any) => {
          if (link.linkedMediaComponentIds?.containedBy) {
            link.linkedMediaComponentIds.containedBy.sort()
          }
        })
      }
      return data
    }

    const baseMediaComponentLinks = convertArrayToObject(
      normalizeData(baseData)._embedded.mediaComponentsLinks,
      'mediaComponentId'
    )
    const compareMediaComponentLinks = convertArrayToObject(
      normalizeData(compareData)._embedded.mediaComponentsLinks,
      'mediaComponentId'
    )

    const differences = getObjectDiff(
      baseMediaComponentLinks,
      compareMediaComponentLinks
    )

    // Track meaningful differences
    const meaningfulDifferences = differences.filter((diffId) => {
      if (
        !baseMediaComponentLinks[diffId] ||
        !compareMediaComponentLinks[diffId]
      ) {
        console.log(
          `Media Component Link ${diffId} only exists in ${
            !baseMediaComponentLinks[diffId] ? 'compare' : 'base'
          } environment`
        )
        return true
      }

      const specificDiffs = getObjectDiff(
        baseMediaComponentLinks[diffId].linkedMediaComponentIds,
        compareMediaComponentLinks[diffId].linkedMediaComponentIds
      )

      if (specificDiffs.length > 0) {
        console.log(`Differences in ${diffId}:`, specificDiffs)
        return true
      }

      return false
    })

    expect(meaningfulDifferences).toHaveLength(0)
  }
})
