import { expect, test } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

const urlPattern = /^https:\/\/.*\.(jpg|webp)(\/.*)?$/

const mediaComponentIds = ['2_0-PaperHats', '10_DarkroomFaith']

test.describe('media components', () => {
  test('returns expected data structure', async ({ request }) => {
    const params = createQueryParams({ ids: mediaComponentIds.join(',') })

    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components?${params}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    const component = data._embedded.mediaComponents.find(
      (c) => c.mediaComponentId === '2_0-PaperHats'
    )

    expect(component).toMatchObject({
      mediaComponentId: expect.any(String),
      componentType: expect.any(String),
      subType: expect.any(String),
      contentType: 'video',
      title: expect.any(String),
      shortDescription: expect.any(String),
      longDescription: expect.any(String),
      imageUrls: {
        thumbnail: expect.stringMatching(urlPattern),
        videoStill: expect.stringMatching(urlPattern)
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

  // TODO: No localized content on stage. Is crowdin working?
  test.fixme(
    'with metadata language returns localized content',
    async ({ request }) => {
      const response = await request.get(
        `${await getBaseUrl()}/v2/media-components?${createQueryParams({
          ids: mediaComponentIds.join(','),
          metadataLanguageTags: 'ur'
        })}`
      )

      expect(response.ok()).toBeTruthy()
      const data = await response.json()
      expect(data._embedded.mediaComponents[0].metadataLanguageTag).toBe('ur')
      expect(data._embedded.mediaComponents.length).toBe(1) // It should filter out the component with no localized content
      expect(data._embedded.mediaComponents[0].mediaComponentId).toBe(
        '1_jf-0-0'
      )
    }
  )

  test('with expand=languageIds includes language data', async ({
    request
  }) => {
    const params = createQueryParams({
      ids: mediaComponentIds[0],
      expand: 'languageIds'
    })

    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components?${params}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    const component = data._embedded.mediaComponents[0]
    expect(component.languageIds).toBeDefined()
    expect(Array.isArray(component.languageIds)).toBeTruthy()
    expect(component.languageIds?.length).toBeGreaterThan(0)
    expect(
      component.languageIds?.every((id) => typeof id === 'number')
    ).toBeTruthy()
  })

  test('filtered by subType returns correct components', async ({
    request
  }) => {
    const params = createQueryParams({ subTypes: 'featureFilm' })

    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components?${params}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data._embedded.mediaComponents.length).toBeGreaterThan(0)
    data._embedded.mediaComponents.forEach((component) => {
      expect(component.subType).toBe('featureFilm')
    })
  })

  test('filtered by languageIds returns correct components', async ({
    request
  }) => {
    const params = createQueryParams({
      languageIds: '569',
      expand: 'languageIds',
      ids: mediaComponentIds.join(',')
    })

    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components?${params}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data._embedded.mediaComponents).toHaveLength(1)
    expect(data._embedded.mediaComponents[0].mediaComponentId).toBe(
      '2_0-PaperHats'
    )
    expect(data._embedded.mediaComponents[0].languageIds).toContain(569)
  })

  test('respects pagination parameters', async ({ request }) => {
    const params = createQueryParams({
      page: '2',
      limit: '1'
    })

    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components?${params}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data._embedded.mediaComponents).toHaveLength(1)
    expect(data.page).toBe(2)
    expect(data.limit).toBe(1)
    expect(data._links).toHaveProperty('previous')
    expect(data._links).toHaveProperty('next')
  })

  test('handles string values for numeric parameters', async ({ request }) => {
    const params = createQueryParams({
      page: '3',
      limit: '2'
    })

    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components?${params}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.page).toBe(3)
    expect(data.limit).toBe(2)
    expect(data._embedded.mediaComponents.length).toBeLessThanOrEqual(2)
  })

  test('media components returns 200 and defaults to english for invalid language with no fallback content', async ({
    request
  }) => {
    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components?${createQueryParams({
        ids: mediaComponentIds[0],
        metadataLanguageTags: 'xx'
      })}`
    )

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data._embedded.mediaComponents.length).toBeGreaterThan(0)
    expect(data._embedded.mediaComponents[0]).toHaveProperty(
      'metadataLanguageTag'
    )
    expect(data._embedded.mediaComponents[0].metadataLanguageTag).toBe('en')
  })

  test('download sizes respect apiKey fallback logic', async ({ request }) => {
    const specialApiKey = '607f41540b2ca6.32427244'
    const regularApiKey = 'regular_test_key'

    // Get download sizes with regular API key
    const regularResponse = await request.get(
      `${await getBaseUrl()}/v2/media-components?${createQueryParams({
        ids: mediaComponentIds[0],
        apiKey: regularApiKey
      })}`
    )
    expect(regularResponse.ok()).toBeTruthy()
    const regularData = await regularResponse.json()
    const regularComponent = regularData._embedded.mediaComponents[0]

    // Get download sizes with special API key
    const specialResponse = await request.get(
      `${await getBaseUrl()}/v2/media-components?${createQueryParams({
        ids: mediaComponentIds[0],
        apiKey: specialApiKey
      })}`
    )
    expect(specialResponse.ok()).toBeTruthy()
    const specialData = await specialResponse.json()
    const specialComponent = specialData._embedded.mediaComponents[0]

    // Both should have downloadSizes
    expect(regularComponent.downloadSizes).toBeDefined()
    expect(specialComponent.downloadSizes).toBeDefined()
    expect(
      regularComponent.downloadSizes.approximateSmallDownloadSizeInBytes
    ).toBeGreaterThanOrEqual(0)
    expect(
      regularComponent.downloadSizes.approximateLargeDownloadSizeInBytes
    ).toBeGreaterThanOrEqual(0)
    expect(
      specialComponent.downloadSizes.approximateSmallDownloadSizeInBytes
    ).toBeGreaterThanOrEqual(0)
    expect(
      specialComponent.downloadSizes.approximateLargeDownloadSizeInBytes
    ).toBeGreaterThanOrEqual(0)

    // Note: We can't directly verify the sizes are different without knowing the exact data,
    // but we verify the structure and that both API keys work
  })

  test('without apiKey still returns valid download sizes', async ({
    request
  }) => {
    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components?${createQueryParams({
        ids: mediaComponentIds[0]
      })}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    const component = data._embedded.mediaComponents[0]

    expect(component.downloadSizes).toBeDefined()
    expect(
      component.downloadSizes.approximateSmallDownloadSizeInBytes
    ).toBeGreaterThanOrEqual(0)
    expect(
      component.downloadSizes.approximateLargeDownloadSizeInBytes
    ).toBeGreaterThanOrEqual(0)
  })
})
