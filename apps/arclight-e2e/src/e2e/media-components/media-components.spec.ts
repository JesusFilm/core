/* eslint-disable playwright/no-conditional-in-test */
import { expect, test } from '@playwright/test'

import {
  createQueryParams,
  getBaseUrl,
  makeParallelRequests
} from '../../framework/helpers'
import type { ApiResponse, MediaComponent } from '../../types'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/comparison-utils'
import { testData } from '../../utils/testData'

test('compare media components between environments', async ({ request }) => {
  const params = createQueryParams({ ids: testData.mediaComponentIds })

  const [baseData, compareData] = await makeParallelRequests(
    request,
    '/v2/media-components',
    params
  )

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
  const params = createQueryParams({})

  const response = (await request
    .get(`${await getBaseUrl()}/v2/media-components?${params}`)
    .then((res) => res.json())) as ApiResponse<MediaComponent>

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
