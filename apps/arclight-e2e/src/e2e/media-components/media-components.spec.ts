/* eslint-disable playwright/no-conditional-in-test */
import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  ApiResponse,
  convertArrayToObject,
  getObjectDiff
} from '../../utils/comparison-utils'
import { apiKey, mediaComponentIds } from '../../utils/testData.json'

test('compare media components between environments', async ({ request }) => {
  const baseUrl = await getBaseUrl()
  const queryParams = new URLSearchParams({
    apiKey,
    ids: mediaComponentIds.join(',')
  })

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}/v2/media-components?${queryParams}`),
    request.get(`https://api.arclight.org/v2/media-components?${queryParams}`)
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseData = await baseResponse.json()
  const compareData = await compareResponse.json()

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
    apiKey: apiKey
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