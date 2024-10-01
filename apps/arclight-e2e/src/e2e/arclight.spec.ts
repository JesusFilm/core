import { expect, test } from '@playwright/test'

import { ArclightApiPage } from '../pages/arclight-api-page'
import {
  MediaComponent,
  compareMediaComponents
} from '../utils/compareMediaComponents'

interface MediaComponentsResponse {
  _embedded: {
    mediaComponents: MediaComponent[]
  }
}

function isMediaComponentsResponse(
  obj: unknown
): obj is MediaComponentsResponse {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    '_embedded' in obj &&
    obj._embedded !== null &&
    typeof obj._embedded === 'object' &&
    'mediaComponents' in obj._embedded &&
    Array.isArray(obj._embedded.mediaComponents)
  )
}

test.describe('Arclight API - Media Components Comparison', () => {
  const baseUrl = process.env.ARCLIGHT_BASE_URL ?? 'http://localhost:4600'
  const compareUrl =
    process.env.ARCLIGHT_COMPARE_URL ?? 'https://admin.arclight.org/v2'

  let baseApiPage: ArclightApiPage
  let compareApiPage: ArclightApiPage

  test.beforeEach(() => {
    baseApiPage = new ArclightApiPage(baseUrl)
    compareApiPage = new ArclightApiPage(compareUrl)
  })

  test('Compare media components from two endpoints', async () => {
    // Fetch media components from base URL
    const baseResponse = await baseApiPage.getMediaComponents()
    expect(baseResponse.status).toBe(200)
    const baseMediaComponents = baseResponse.data

    // Fetch media components from compare URL
    const compareResponse = await compareApiPage.getMediaComponents()
    expect(compareResponse.status).toBe(200)
    const compareMediaComponentsData = compareResponse.data

    console.log('Comparing media components...')
    console.log('Base media components:')
    console.log(baseMediaComponents)
    console.log('Compare media components:')
    console.log(compareMediaComponentsData)

    // Log differences
    if (differences.length > 0) {
      console.log('Differences found:')
      differences.forEach((diff) => {
        console.log(diff)
      })
    }

    // Expect no differences
    expect(differences).toEqual([])
  })
})
