import { expect, test } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../../framework/helpers'

const mediaComponentId = '2_0-ConsideringChristmas'

test('media component returns expected data structure', async ({ request }) => {
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-components/${mediaComponentId}?${createQueryParams({})}`
  )

  expect(response.ok()).toBeTruthy()
  const data = await response.json()

  expect(data).toMatchObject({
    mediaComponentId: expect.any(String),
    componentType: expect.any(String),
    subType: expect.any(String),
    contentType: 'video',
    title: expect.any(String),
    shortDescription: expect.any(String),
    longDescription: expect.any(String),
    imageUrls: {
      thumbnail: expect.stringMatching(/^https:\/\/.*\.(jpg|webp)/),
      videoStill: expect.stringMatching(/^https:\/\/.*\.(jpg|webp)/)
    },
    lengthInMilliseconds: expect.any(Number),
    containsCount: expect.any(Number),
    isDownloadable: expect.any(Boolean),
    downloadSizes: {
      approximateSmallDownloadSizeInBytes: expect.any(Number),
      approximateLargeDownloadSizeInBytes: expect.any(Number)
    },
    bibleCitations: expect.any(Array),
    primaryLanguageId: expect.any(Number),
    studyQuestions: expect.any(Array),
    metadataLanguageTag: expect.any(String)
  })
})

// TODO: Check if crowdin import is working on stage
test.fixme(
  'media component with metadata language returns localized content',
  async ({ request }) => {
    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components/${mediaComponentId}?${createQueryParams({ metadataLanguageTags: 'es' })}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.metadataLanguageTag).toBe('es')
  }
)

test('media component with expand=languageIds includes language data', async ({
  request
}) => {
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-components/${mediaComponentId}?${createQueryParams({ expand: 'languageIds' })}`
  )

  expect(response.ok()).toBeTruthy()
  const data = await response.json()
  expect(data.languageIds).toBeDefined()
  expect(Array.isArray(data.languageIds)).toBeTruthy()
  expect(data.languageIds.length).toBeGreaterThan(0)
  expect(
    data.languageIds.every((id: any) => typeof id === 'number')
  ).toBeTruthy()
})

test('media component with filter=descriptorsonly returns only descriptors', async ({
  request
}) => {
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-components/${mediaComponentId}?${createQueryParams({ filter: 'descriptorsonly' })}`
  )

  expect(response.ok()).toBeTruthy()
  const data = await response.json()

  // Should include only descriptive fields
  expect(data).toMatchObject({
    mediaComponentId: expect.any(String),
    title: expect.any(String),
    shortDescription: expect.any(String),
    longDescription: expect.any(String),
    studyQuestions: expect.any(Array),
    metadataLanguageTag: expect.any(String),
    _links: expect.any(Object)
  })

  // Should not include technical fields
  expect(data).not.toHaveProperty('componentType')
  expect(data).not.toHaveProperty('subType')
  expect(data).not.toHaveProperty('contentType')
  expect(data).not.toHaveProperty('imageUrls')
  expect(data).not.toHaveProperty('lengthInMilliseconds')
  expect(data).not.toHaveProperty('containsCount')
  expect(data).not.toHaveProperty('isDownloadable')
  expect(data).not.toHaveProperty('downloadSizes')
})

test('media component with platform parameter affects sample language link', async ({
  request
}) => {
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-components/${mediaComponentId}?${createQueryParams({ platform: 'android' })}`
  )

  expect(response.ok()).toBeTruthy()
  const data = await response.json()
  expect(data._links.sampleMediaComponentLanguage.href).toContain(
    'platform=android'
  )
})

test('media component returns 400 for non-existent ID', async ({ request }) => {
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-components/non_existent_id?${createQueryParams({})}`
  )

  expect(response.status()).toBe(404)
  const data = await response.json()
  expect(data).toMatchObject({
    message: expect.stringContaining('not found'),
    logref: 404
  })
})

test('media component returns 200 and defaults to english for invalid language with no fallback content', async ({
  request
}) => {
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-components/${mediaComponentId}?${createQueryParams({ metadataLanguageTags: 'xx' })}`
  )

  expect(response.ok()).toBeTruthy()
  expect(response.status()).toBe(200)
  const data = await response.json()
  expect(data).toHaveProperty('metadataLanguageTag')
  expect(data.metadataLanguageTag).toBe('en')
})
