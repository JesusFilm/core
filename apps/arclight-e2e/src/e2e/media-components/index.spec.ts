import { expect, test } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'
import type { ApiResponse, MediaComponent } from '../../types'
import { getObjectDiff } from '../../utils/comparison-utils'

import {
  defaultMediaComponentsResponse,
  mediaComponentIds,
  mediaComponentIdsForLanguageTest
} from './media-components.testData'

const urlPattern = /^https:\/\/.*\.(jpg|webp)(\/.*)?$/

function validateComponent(
  component: MediaComponent,
  expected: MediaComponent
) {
  expect(component.imageUrls).toMatchObject({
    thumbnail: expect.stringMatching(urlPattern),
    videoStill: expect.stringMatching(urlPattern),
    mobileCinematicHigh: expect.stringMatching(urlPattern),
    mobileCinematicLow: expect.stringMatching(urlPattern),
    mobileCinematicVeryLow: expect.stringMatching(urlPattern)
  })

  const componentWithoutImages = { ...component, imageUrls: undefined }
  const expectedWithoutImages = { ...expected, imageUrls: undefined }

  const diffs = getObjectDiff(componentWithoutImages, expectedWithoutImages)
  expect(
    diffs,
    `Differences found in media component ${component.mediaComponentId}`
  ).toHaveLength(0)
}

test('media components default response matches expected shape', async ({
  request
}) => {
  const params = createQueryParams({ ids: mediaComponentIds })
  const response = (await request
    .get(`${await getBaseUrl()}/v2/media-components?${params}`)
    .then((res) => res.json())) as ApiResponse<MediaComponent>

  // Verify we got all expected components (order independent)
  expect(
    new Set(response._embedded.mediaComponents.map((c) => c.mediaComponentId))
  ).toEqual(new Set(mediaComponentIds))

  // Full validation of each component
  response._embedded.mediaComponents.forEach((component) => {
    const expectedComponent =
      defaultMediaComponentsResponse._embedded.mediaComponents.find(
        (e) => e.mediaComponentId === component.mediaComponentId
      )
    expect(
      expectedComponent,
      `No expected component found for ${component.mediaComponentId}`
    ).toBeDefined()
    validateComponent(component, expectedComponent!)
  })
})

test('media components filtered by languageIds filters correctly', async ({
  request
}) => {
  const params = createQueryParams({
    languageIds: '3934',
    expand: 'languageIds',
    ids: mediaComponentIdsForLanguageTest
  })
  const response = (await request
    .get(`${await getBaseUrl()}/v2/media-components?${params}`)
    .then((res) => res.json())) as ApiResponse<MediaComponent>

  expect(response._embedded.mediaComponents).toHaveLength(1)
  expect(response._embedded.mediaComponents[0].languageIds).toContain(3934)
})

test('media components with expand=languageIds includes language data', async ({
  request
}) => {
  const params = createQueryParams({ ids: '1_mld-0-0', expand: 'languageIds' })
  const response = (await request
    .get(`${await getBaseUrl()}/v2/media-components?${params}`)
    .then((res) => res.json())) as ApiResponse<MediaComponent>

  expect(response._embedded.mediaComponents).toHaveLength(1)
  expect(
    response._embedded.mediaComponents[0].languageIds?.length
  ).toBeGreaterThan(0)
})

test('media components filtered by subType returns correct components', async ({
  request
}) => {
  const params = createQueryParams({ subTypes: 'featureFilm' })
  const response = (await request
    .get(`${await getBaseUrl()}/v2/media-components?${params}`)
    .then((res) => res.json())) as ApiResponse<MediaComponent>

  expect(response._embedded.mediaComponents.length).toBeGreaterThan(0)
  response._embedded.mediaComponents.forEach((component) => {
    expect(component.subType).toBe('featureFilm')
  })
})

test('media components with metadataLanguageTags returns localized content', async ({
  request
}) => {
  const params = createQueryParams({
    ids: mediaComponentIds[0],
    metadataLanguageTags: 'es'
  })
  const response = (await request
    .get(`${await getBaseUrl()}/v2/media-components?${params}`)
    .then((res) => res.json())) as ApiResponse<MediaComponent>

  expect(response._embedded.mediaComponents[0].metadataLanguageTag).toBe('es')
})

test('media components respects pagination parameters', async ({ request }) => {
  const params = createQueryParams({
    page: '2',
    limit: '1'
  })
  const response = (await request
    .get(`${await getBaseUrl()}/v2/media-components?${params}`)
    .then((res) => res.json())) as ApiResponse<MediaComponent>

  expect(response._embedded.mediaComponents).toHaveLength(1)
  expect(response.page).toBe(2)
  expect(response.limit).toBe(1)
  expect(response._links).toHaveProperty('previous')
  expect(response._links).toHaveProperty('next')
})
