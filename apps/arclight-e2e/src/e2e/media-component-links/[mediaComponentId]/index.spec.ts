import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../../framework/helpers'

interface TestCase {
  mediaComponentId: string
  params: Record<string, any>
}

const testCases = {
  collectionOnlyContains: {
    mediaComponentId: 'JFM1',
    params: {}
  },
  videoOnlyContainedBy: {
    mediaComponentId: '2_0-ConsideringChristmas',
    params: {}
  },
  collectionAndVideo: {
    mediaComponentId: '10_DarkroomFaith',
    params: {}
  },
  withLanguageIds: {
    mediaComponentId: '10_DarkroomFaith',
    params: { languageIds: '3934' }
  },
  withExpandedComponents: {
    mediaComponentId: '10_DarkroomFaith',
    params: { expand: 'mediaComponents,languageIds' }
  },
  withContainsRelOnly: {
    mediaComponentId: '10_DarkroomFaith',
    params: { rel: 'contains' }
  }
}

async function getMediaComponentLink(
  request: APIRequestContext,
  testCase: TestCase
) {
  const { params, mediaComponentId } = testCase
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-component-links/${mediaComponentId}?${queryParams}`
  )
  if (!response.ok()) {
    console.log(`Failed request for ${mediaComponentId}:`, {
      status: response.status(),
      statusText: response.statusText(),
      body: await response.text()
    })
  }
  return response
}

test.describe('single media component link', () => {
  test('verify collection with only contains relationship', async ({
    request
  }) => {
    const response = await getMediaComponentLink(
      request,
      testCases.collectionOnlyContains
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      mediaComponentId: 'JFM1',
      linkedMediaComponentIds: {
        contains: expect.any(Array)
      },
      _links: expect.any(Object)
    })

    expect(data.linkedMediaComponentIds.contains.length).toBeGreaterThan(0)
    expect(data.linkedMediaComponentIds.containedBy).toBeUndefined()
  })

  test('verify video with only containedBy relationship', async ({
    request
  }) => {
    const response = await getMediaComponentLink(
      request,
      testCases.videoOnlyContainedBy
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      mediaComponentId: '2_0-ConsideringChristmas',
      linkedMediaComponentIds: {
        containedBy: expect.any(Array)
      }
    })

    expect(data.linkedMediaComponentIds.containedBy.length).toBe(1)
    expect(data.linkedMediaComponentIds.contains).toBeUndefined()
  })

  test('verify content with both relationships', async ({ request }) => {
    const response = await getMediaComponentLink(
      request,
      testCases.collectionAndVideo
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      mediaComponentId: '10_DarkroomFaith',
      linkedMediaComponentIds: {
        contains: expect.any(Array),
        containedBy: expect.any(Array)
      }
    })

    expect(data.linkedMediaComponentIds.contains.length).toBeGreaterThan(0)
    expect(data.linkedMediaComponentIds.containedBy.length).toBeGreaterThan(0)
  })

  test('verify language filtering', async ({ request }) => {
    const response = await getMediaComponentLink(
      request,
      testCases.withLanguageIds
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      mediaComponentId: '10_DarkroomFaith',
      linkedMediaComponentIds: {
        contains: expect.any(Array)
      }
    })

    expect(data.linkedMediaComponentIds.contains.length).toBe(0)
    expect(data.linkedMediaComponentIds.containedBy.length).toBeGreaterThan(0)
  })

  test('verify expanded components data', async ({ request }) => {
    const response = await getMediaComponentLink(
      request,
      testCases.withExpandedComponents
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      mediaComponentId: '10_DarkroomFaith',
      linkedMediaComponentIds: expect.any(Object),
      _embedded: {
        contains: expect.any(Array)
      }
    })

    const component = data._embedded.contains[0]
    expect(component).toMatchObject({
      mediaComponentId: expect.any(String),
      componentType: expect.any(String),
      contentType: expect.any(String),
      subType: expect.any(String),
      imageUrls: {
        thumbnail: expect.any(String),
        videoStill: expect.any(String),
        mobileCinematicHigh: expect.any(String),
        mobileCinematicLow: expect.any(String),
        mobileCinematicVeryLow: expect.any(String)
      },
      lengthInMilliseconds: expect.any(Number),
      containsCount: expect.any(Number),
      isDownloadable: expect.any(Boolean),
      primaryLanguageId: expect.any(Number),
      languageIds: expect.any(Array),
      title: expect.any(String),
      shortDescription: expect.any(String),
      longDescription: expect.any(String),
      studyQuestions: expect.any(Array),
      metadataLanguageTag: expect.any(String)
    })
  })

  test('verify contains-only relationship filter', async ({ request }) => {
    const response = await getMediaComponentLink(
      request,
      testCases.withContainsRelOnly
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      mediaComponentId: '10_DarkroomFaith',
      linkedMediaComponentIds: {
        contains: expect.any(Array)
      }
    })

    expect(data.linkedMediaComponentIds.containedBy).toBeUndefined()
    expect(data.linkedMediaComponentIds.contains.length).toBeGreaterThan(0)
  })

  test('apiKey parameter affects download sizes', async ({ request }) => {
    const specialApiKey = '607f41540b2ca6.32427244'
    const regularApiKey = 'regular_test_key'

    // Get with regular API key
    const regularResponse = await getMediaComponentLink(request, {
      ...testCases.withExpandedComponents,
      params: {
        ...testCases.withExpandedComponents.params,
        apiKey: regularApiKey
      }
    })
    expect(regularResponse.ok()).toBeTruthy()
    const regularData = await regularResponse.json()

    // Get with special API key
    const specialResponse = await getMediaComponentLink(request, {
      ...testCases.withExpandedComponents,
      params: {
        ...testCases.withExpandedComponents.params,
        apiKey: specialApiKey
      }
    })
    expect(specialResponse.ok()).toBeTruthy()
    const specialData = await specialResponse.json()

    // Both should have the same structure
    expect(regularData).toMatchObject({
      mediaComponentId: expect.any(String),
      linkedMediaComponentIds: expect.any(Object),
      _links: expect.any(Object)
    })
    expect(specialData).toMatchObject({
      mediaComponentId: expect.any(String),
      linkedMediaComponentIds: expect.any(Object),
      _links: expect.any(Object)
    })

    // Verify expanded components structure (should exist due to expand parameter)
    expect(regularData._embedded?.contains).toBeDefined()
    expect(specialData._embedded?.contains).toBeDefined()
    expect(Array.isArray(regularData._embedded?.contains)).toBeTruthy()
    expect(Array.isArray(specialData._embedded?.contains)).toBeTruthy()

    // Verify component structure in embedded data
    regularData._embedded.contains.forEach((component: any) => {
      expect(component).toMatchObject({
        mediaComponentId: expect.any(String),
        downloadSizes: expect.objectContaining({
          approximateSmallDownloadSizeInBytes: expect.any(Number),
          approximateLargeDownloadSizeInBytes: expect.any(Number)
        })
      })
    })

    specialData._embedded.contains.forEach((component: any) => {
      expect(component).toMatchObject({
        mediaComponentId: expect.any(String),
        downloadSizes: expect.objectContaining({
          approximateSmallDownloadSizeInBytes: expect.any(Number),
          approximateLargeDownloadSizeInBytes: expect.any(Number)
        })
      })
    })
  })
})
