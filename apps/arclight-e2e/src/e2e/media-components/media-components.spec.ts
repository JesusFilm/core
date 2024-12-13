/* eslint-disable playwright/no-conditional-in-test */
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
  const queryParams = new URLSearchParams({
    apiKey: testData.apiKey,
    ids: testData.mediaComponents.join(',')
  })

  const [baseData, compareData] = await Promise.all([
    request
      .get(`${baseUrl}/v2/media-components?${queryParams}`)
      .then((res) => res.json()),
    request
      .get(`https://api.arclight.org/v2/media-components?${queryParams}`)
      .then((res) => res.json())
  ])

  const baseComponents = convertArrayToObject(
    baseData._embedded.mediaComponents,
    'mediaComponentId'
  )
  const compareComponents = convertArrayToObject(
    compareData._embedded.mediaComponents,
    'mediaComponentId'
  )

  const diffs = getObjectDiff(baseComponents, compareComponents).filter(
    (diffId) => {
      const baseComp = baseComponents[diffId]
      const compareComp = compareComponents[diffId]
      return (
        !baseComp ||
        !compareComp ||
        getObjectDiff(baseComp, compareComp).length > 0
      )
    }
  )

  expect(diffs).toHaveLength(0)
})

test('verify required image fields exist', async ({ request }) => {
  const baseUrl = await getBaseUrl()
  const queryParams = new URLSearchParams({
    apiKey: testData.apiKey
  })

  const response = (await request
    .get(`${baseUrl}/v2/media-components?${queryParams}`)
    .then((res) => res.json())) as ApiResponse

  expect(response._embedded.mediaComponents).toBeDefined()

  const requiredImageFields = [
    'thumbnail',
    'videoStill',
    'mobileCinematicHigh',
    'mobileCinematicLow',
    'mobileCinematicVeryLow'
  ]

  response._embedded.mediaComponents?.forEach((comp) => {
    requiredImageFields.forEach((field) => {
      expect(
        comp.imageUrls?.[field],
        `Media component ${comp.mediaComponentId} missing required field: ${field}`
      ).toBeDefined()
    })
  })
})
