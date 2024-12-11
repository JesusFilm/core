/* eslint-disable playwright/no-conditional-in-test */
import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  ApiResponse,
  convertArrayToObject,
  getObjectDiff
} from '../../utils/media-component-utils'
import testData from '../../utils/testData.json'

test.fixme(
  'compare media components between environments',
  async ({ request }) => {
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

      const normalizeData = (data: any) => {
        if (data._embedded?.mediaComponents) {
          data._embedded.mediaComponents.forEach((comp: any) => {
            const imageFields = [
              'imageUrl',
              'thumbnail',
              'videoStill',
              'mobileCinematicHigh',
              'mobileCinematicLow',
              'mobileCinematicVeryLow'
            ]

            imageFields.forEach((field) => {
              if (comp[field]) {
                comp[field] = true
              }
            })
          })
        }
        return data
      }

      const baseMediaComponents = convertArrayToObject(
        normalizeData(baseData)._embedded.mediaComponents,
        'mediaComponentId'
      )
      const compareMediaComponents = convertArrayToObject(
        normalizeData(compareData)._embedded.mediaComponents,
        'mediaComponentId'
      )

      const differences = getObjectDiff(
        baseMediaComponents,
        compareMediaComponents
      )

      const meaningfulDifferences = differences.filter((diffId) => {
        if (!baseMediaComponents[diffId] || !compareMediaComponents[diffId]) {
          console.log(
            `Media Component ${diffId} only exists in ${!baseMediaComponents[diffId] ? 'compare' : 'base'} environment`
          )
          return true
        }

        const specificDiffs = getObjectDiff(
          baseMediaComponents[diffId],
          compareMediaComponents[diffId]
        )

        if (specificDiffs.length > 0) {
          console.log(`Differences in ${diffId}:`, specificDiffs)
          return true
        }

        return false
      })

      expect(meaningfulDifferences).toHaveLength(0)
    }
  }
)
