import { expect, test } from '@playwright/test'

import {
  cleanResponse,
  createQueryParams,
  getBaseUrl
} from '../../framework/helpers'
import type { MediaComponent } from '../../types'
import { getObjectDiff } from '../../utils/comparison-utils'

import {
  mediaComponentId,
  mediaComponentTestData
} from './media-component.testData'

const urlPattern = /^https:\/\/.*\.(jpg|webp)(\/.*)?$/

async function getMediaComponent(request: any, params = {}) {
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-components/${mediaComponentId}?${queryParams}`
  )
  expect(response.ok()).toBeTruthy()
  return response.json()
}

function validateComponent(
  component: Partial<MediaComponent>,
  expected: MediaComponent
) {
  expect(component).toBeDefined()
  expect(component.mediaComponentId).toBe(expected.mediaComponentId)
  expect(component.imageUrls).toBeDefined()
  expect(component.imageUrls).toMatchObject({
    thumbnail: expect.stringMatching(urlPattern),
    videoStill: expect.stringMatching(urlPattern),
    mobileCinematicHigh: expect.stringMatching(urlPattern),
    mobileCinematicLow: expect.stringMatching(urlPattern),
    mobileCinematicVeryLow: expect.stringMatching(urlPattern)
  })

  const componentWithoutImages = { ...component, imageUrls: undefined }
  const expectedWithoutImages = { ...expected, imageUrls: undefined }
  return getObjectDiff(componentWithoutImages, expectedWithoutImages)
}

test('compare single media component between environments', async ({
  request
}) => {
  const data = await getMediaComponent(request)
  const cleanedData = cleanResponse(data, ['_links'])
  const diffs = validateComponent(cleanedData, mediaComponentTestData)
  expect(
    diffs,
    `Differences found in media component ${mediaComponentId}`
  ).toHaveLength(0)
})

test('media component with metadataLanguageTags returns localized content', async ({
  request
}) => {
  const data = await getMediaComponent(request, { metadataLanguageTags: 'es' })
  expect(data.metadataLanguageTag).toBe('es')
})

test('media component with expand=languageIds includes language data', async ({
  request
}) => {
  const data = await getMediaComponent(request, { expand: 'languageIds' })
  expect(data.languageIds).toBeDefined()
  expect(data.languageIds.length).toBeGreaterThan(0)
})

test('media component with filter=descriptorsonly returns only descriptors', async ({
  request
}) => {
  const data = await getMediaComponent(request, { filter: 'descriptorsonly' })

  expect(data).toMatchObject({
    mediaComponentId,
    title: expect.any(String),
    shortDescription: expect.any(String),
    longDescription: expect.any(String),
    studyQuestions: expect.any(Array),
    metadataLanguageTag: expect.any(String),
    _links: expect.any(Object)
  })

  expect(data).not.toHaveProperty('componentType')
  expect(data).not.toHaveProperty('subType')
  expect(data).not.toHaveProperty('contentType')
  expect(data).not.toHaveProperty('imageUrls')
})
