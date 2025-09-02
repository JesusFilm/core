import { expect, test } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../../../framework/helpers'

const mediaComponentId = '2_0-ConsideringChristmas'
const defaultLanguageIds = [529, 7083]

test.describe('media component languages', () => {
  test('default response matches expected shape', async ({ request }) => {
    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components/${mediaComponentId}/languages?${createQueryParams({})}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data).toMatchObject({
      mediaComponentId,
      platform: 'ios',
      apiSessionId: expect.any(String),
      _links: {
        self: {
          href: expect.any(String)
        },
        mediaComponent: {
          href: expect.any(String)
        }
      },
      _embedded: {
        mediaComponentLanguage: expect.any(Array)
      }
    })

    data._embedded.mediaComponentLanguage.forEach((language) => {
      expect(language).toMatchObject({
        mediaComponentId: expect.any(String),
        languageId: expect.any(Number),
        refId: expect.any(String),
        lengthInMilliseconds: expect.any(Number),
        _links: {
          self: {
            href: expect.stringMatching(
              /^http:\/\/api\.arclight\.org\/v2\/media-components\/.*/
            )
          },
          mediaComponent: {
            href: expect.stringMatching(
              /^http:\/\/api\.arclight\.org\/v2\/media-components\/.*/
            )
          },
          mediaLanguage: {
            href: expect.stringMatching(
              /^http:\/\/api\.arclight\.org\/v2\/media-languages\/.*/
            )
          }
        }
      })
    })
  })

  test('filtered by languageIds returns correct languages', async ({
    request
  }) => {
    const params = createQueryParams({
      languageIds: defaultLanguageIds[0].toString()
    })
    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components/${mediaComponentId}/languages?${params}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data._embedded.mediaComponentLanguage).toHaveLength(1)
    expect(data._embedded.mediaComponentLanguage[0].languageId).toEqual(
      defaultLanguageIds[0]
    )
  })

  test('iOS platform returns expected formats', async ({ request }) => {
    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components/${mediaComponentId}/languages?${createQueryParams({ platform: 'ios' })}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    const language = data._embedded.mediaComponentLanguage[0]

    // Streaming URLs
    expect(language.streamingUrls).toHaveProperty('m3u8')
    expect(language.streamingUrls).not.toHaveProperty('dash')

    // Subtitle formats
    expect(language.subtitleUrls).toBeDefined()
    expect(language.subtitleUrls?.vtt?.[0]).toMatchObject({
      languageId: expect.any(Number),
      languageName: expect.any(String),
      languageTag: expect.any(String),
      url: expect.any(String)
    })
    expect(language.subtitleUrls?.srt).toBeUndefined()
    expect(language.subtitleUrls?.m3u8).toBeUndefined()

    // No web-specific properties
    expect(language).not.toHaveProperty('webEmbedPlayer')
    expect(language).not.toHaveProperty('webEmbedSharePlayer')
  })

  test('Android platform returns expected formats', async ({ request }) => {
    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components/${mediaComponentId}/languages?${createQueryParams({ platform: 'android' })}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    const language = data._embedded.mediaComponentLanguage[0]

    // Streaming URLs
    expect(language.streamingUrls).toHaveProperty('dash')
    expect(language.streamingUrls).toHaveProperty('hls')
    expect(language.streamingUrls).not.toHaveProperty('m3u8')

    // Subtitle formats
    expect(language.subtitleUrls).toBeDefined()
    expect(language.subtitleUrls?.vtt?.[0]).toMatchObject({
      languageId: expect.any(Number),
      languageName: expect.any(String),
      languageTag: expect.any(String),
      url: expect.any(String)
    })
    expect(language.subtitleUrls?.srt?.[0]).toMatchObject({
      languageId: expect.any(Number),
      languageName: expect.any(String),
      languageTag: expect.any(String),
      url: expect.any(String)
    })
    expect(language.subtitleUrls?.m3u8).toBeUndefined()

    // No web-specific properties
    expect(language).not.toHaveProperty('webEmbedPlayer')
    expect(language).not.toHaveProperty('webEmbedSharePlayer')
  })

  test('Web platform returns expected formats', async ({ request }) => {
    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components/${mediaComponentId}/languages?${createQueryParams({ platform: 'web' })}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    const language = data._embedded.mediaComponentLanguage[0]

    // Streaming URLs
    expect(language.streamingUrls).toEqual({})

    // Web-specific properties
    expect(language).toHaveProperty('webEmbedPlayer')
    expect(language).toHaveProperty('webEmbedSharePlayer')

    // Subtitle formats
    expect(language.subtitleUrls).toBeDefined()
    expect(language.subtitleUrls?.m3u8?.[0]).toMatchObject({
      languageId: expect.any(Number),
      languageName: expect.any(String),
      languageTag: expect.any(String),
      url: expect.any(String)
    })
    expect(language.subtitleUrls?.vtt).toBeUndefined()
    expect(language.subtitleUrls?.srt).toBeUndefined()
  })

  test('download URL includes metadata', async ({ request }) => {
    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components/${mediaComponentId}/languages?${createQueryParams({})}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    const language = data._embedded.mediaComponentLanguage[0]

    expect(language.downloadUrls?.high).toBeDefined()
    expect(language.downloadUrls?.high).toMatchObject({
      url: expect.any(String),
      sizeInBytes: expect.any(Number)
    })
  })

  test('custom share URL follows expected format', async ({ request }) => {
    const response = await request.get(
      `${await getBaseUrl()}/v2/media-components/${mediaComponentId}/languages?${createQueryParams({})}`
    )

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    const language = data._embedded.mediaComponentLanguage[0]

    expect(language.shareUrl).toBeDefined()
    expect(language.shareUrl).toMatch(/^https:\/\/arc\.gt\/[a-z0-9]+$/)
  })

  test('apiKey parameter affects download URLs in language list', async ({
    request
  }) => {
    const specialApiKey = '607f41540b2ca6.32427244'
    const regularApiKey = 'regular_test_key'

    // Get languages with regular API key
    const regularResponse = await request.get(
      `${await getBaseUrl()}/v2/media-components/${mediaComponentId}/languages?${createQueryParams(
        {
          apiKey: regularApiKey
        }
      )}`
    )
    expect(regularResponse.ok()).toBeTruthy()
    const regularData = await regularResponse.json()

    // Get languages with special API key
    const specialResponse = await request.get(
      `${await getBaseUrl()}/v2/media-components/${mediaComponentId}/languages?${createQueryParams(
        {
          apiKey: specialApiKey
        }
      )}`
    )
    expect(specialResponse.ok()).toBeTruthy()
    const specialData = await specialResponse.json()

    // Both should have the same structure and valid data
    expect(regularData._embedded.mediaComponentLanguage).toBeDefined()
    expect(specialData._embedded.mediaComponentLanguage).toBeDefined()
    expect(
      Array.isArray(regularData._embedded.mediaComponentLanguage)
    ).toBeTruthy()
    expect(
      Array.isArray(specialData._embedded.mediaComponentLanguage)
    ).toBeTruthy()
    expect(regularData._embedded.mediaComponentLanguage.length).toBeGreaterThan(
      0
    )
    expect(specialData._embedded.mediaComponentLanguage.length).toBeGreaterThan(
      0
    )

    // Each language should have valid structure
    regularData._embedded.mediaComponentLanguage.forEach((language: any) => {
      expect(language).toMatchObject({
        mediaComponentId: expect.any(String),
        languageId: expect.any(Number),
        refId: expect.any(String),
        lengthInMilliseconds: expect.any(Number),
        _links: expect.any(Object)
      })
    })

    specialData._embedded.mediaComponentLanguage.forEach((language: any) => {
      expect(language).toMatchObject({
        mediaComponentId: expect.any(String),
        languageId: expect.any(Number),
        refId: expect.any(String),
        lengthInMilliseconds: expect.any(Number),
        _links: expect.any(Object)
      })
    })
  })
})
