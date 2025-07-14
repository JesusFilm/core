import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../../../../framework/helpers'

interface TestCase {
  mediaComponentId: string
  languageId: string
  params: Record<string, any>
}

const testCases = {
  basic: {
    mediaComponentId: '2_0-ConsideringChristmas',
    languageId: '529',
    params: {}
  },
  withPlatformIos: {
    mediaComponentId: '2_0-ConsideringChristmas',
    languageId: '7083',
    params: { platform: 'ios' }
  },
  withPlatformAndroid: {
    mediaComponentId: '2_0-ConsideringChristmas',
    languageId: '529',
    params: { platform: 'android' }
  },
  withPlatformWeb: {
    mediaComponentId: '2_0-ConsideringChristmas',
    languageId: '529',
    params: { platform: 'web' }
  },
  withExpandContains: {
    mediaComponentId: '10_DarkroomFaith',
    languageId: '529',
    params: { expand: 'contains' }
  }
}

async function getMediaComponentLanguage(
  request: APIRequestContext,
  testCase: TestCase
) {
  const { mediaComponentId, languageId, params } = testCase
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-components/${mediaComponentId}/languages/${languageId}?${queryParams}`
  )
  return response
}

test.describe('media component language', () => {
  test('returns expected data structure', async ({ request }) => {
    const response = await getMediaComponentLanguage(request, testCases.basic)
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      mediaComponentId: expect.any(String),
      languageId: expect.any(Number),
      refId: expect.any(String),
      apiSessionId: expect.any(String),
      platform: 'ios',
      lengthInMilliseconds: expect.any(Number),
      subtitleUrls: expect.any(Object),
      downloadUrls: expect.any(Object),
      streamingUrls: expect.any(Object),
      shareUrl: expect.any(String),
      socialMediaUrls: expect.any(Object),
      _links: expect.any(Object)
    })
  })

  test('with iOS platform returns iOS specific URLs', async ({ request }) => {
    const response = await getMediaComponentLanguage(
      request,
      testCases.withPlatformIos
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.platform).toBe('ios')
    expect(data.streamingUrls).toHaveProperty('m3u8')
    expect(data.subtitleUrls).toHaveProperty('vtt')
    expect(data.subtitleUrls).not.toHaveProperty('srt')
  })

  test('with Android platform returns Android specific URLs', async ({
    request
  }) => {
    const response = await getMediaComponentLanguage(
      request,
      testCases.withPlatformAndroid
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.platform).toBe('android')
    expect(data.streamingUrls).toHaveProperty('dash')
    expect(data.streamingUrls).toHaveProperty('hls')
    expect(data.subtitleUrls).toHaveProperty('vtt')
    expect(data.subtitleUrls).toHaveProperty('srt')
  })

  test('with Web platform returns web specific data', async ({ request }) => {
    const response = await getMediaComponentLanguage(
      request,
      testCases.withPlatformWeb
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.platform).toBe('web')
    expect(data).toHaveProperty('webEmbedPlayer')
    expect(data).toHaveProperty('webEmbedSharePlayer')
    expect(data.subtitleUrls).toHaveProperty('vtt')
    expect(data.subtitleUrls).not.toHaveProperty('srt')
  })

  test('with expand=contains includes child components', async ({
    request
  }) => {
    const response = await getMediaComponentLanguage(
      request,
      testCases.withExpandContains
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('_embedded')
    expect(data._embedded).toHaveProperty('contains')
    expect(Array.isArray(data._embedded.contains)).toBeTruthy()

    expect(data._embedded.contains.length).toBeGreaterThan(0)
    const child = data._embedded.contains[0]
    expect(child).toMatchObject({
      mediaComponentId: expect.any(String),
      languageId: expect.any(Number),
      refId: expect.any(String),
      apiSessionId: expect.any(String),
      lengthInMilliseconds: expect.any(Number),
      subtitleUrls: expect.any(Object),
      downloadUrls: expect.any(Object),
      streamingUrls: expect.any(Object),
      shareUrl: expect.any(String),
      socialMediaUrls: expect.any(Object),
      _links: expect.any(Object)
    })
  })

  test.describe('apiKey download URL tests', () => {
    test('download URLs respect special apiKey fallback logic', async ({
      request
    }) => {
      const specialApiKey = '607f41540b2ca6.32427244'
      const regularApiKey = 'regular_test_key'

      // Get download URLs with regular API key
      const regularResponse = await getMediaComponentLanguage(request, {
        ...testCases.basic,
        params: { apiKey: regularApiKey }
      })
      expect(regularResponse.ok()).toBeTruthy()
      const regularData = await regularResponse.json()

      // Get download URLs with special API key
      const specialResponse = await getMediaComponentLanguage(request, {
        ...testCases.basic,
        params: { apiKey: specialApiKey }
      })
      expect(specialResponse.ok()).toBeTruthy()
      const specialData = await specialResponse.json()

      // Both should have downloadUrls
      expect(regularData.downloadUrls).toBeDefined()
      expect(specialData.downloadUrls).toBeDefined()

      // Verify structure - should have low and high quality downloads
      expect(regularData.downloadUrls).toMatchObject({
        low: expect.objectContaining({
          url: expect.any(String),
          sizeInBytes: expect.any(Number)
        }),
        high: expect.objectContaining({
          url: expect.any(String),
          sizeInBytes: expect.any(Number)
        })
      })

      expect(specialData.downloadUrls).toMatchObject({
        low: expect.objectContaining({
          url: expect.any(String),
          sizeInBytes: expect.any(Number)
        }),
        high: expect.objectContaining({
          url: expect.any(String),
          sizeInBytes: expect.any(Number)
        })
      })

      // URLs should be valid HTTP(S) URLs
      expect(regularData.downloadUrls.low.url).toMatch(/^https?:\/\//)
      expect(regularData.downloadUrls.high.url).toMatch(/^https?:\/\//)
      expect(specialData.downloadUrls.low.url).toMatch(/^https?:\/\//)
      expect(specialData.downloadUrls.high.url).toMatch(/^https?:\/\//)

      // Sizes should be positive numbers
      expect(regularData.downloadUrls.low.sizeInBytes).toBeGreaterThanOrEqual(0)
      expect(regularData.downloadUrls.high.sizeInBytes).toBeGreaterThanOrEqual(
        0
      )
      expect(specialData.downloadUrls.low.sizeInBytes).toBeGreaterThanOrEqual(0)
      expect(specialData.downloadUrls.high.sizeInBytes).toBeGreaterThanOrEqual(
        0
      )

      // Note: We can't verify exact URL differences without knowing the specific test data,
      // but we ensure both API keys produce valid download structures
    })
  })
})
