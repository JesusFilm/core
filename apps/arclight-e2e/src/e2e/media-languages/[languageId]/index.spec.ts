import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../../framework/helpers'

interface TestCase {
  languageId: string
  params: Record<string, any>
}

async function getMediaLanguage(
  request: APIRequestContext,
  testCase: TestCase
) {
  const { languageId, params } = testCase
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-languages/${languageId}?${queryParams}`
  )
  return response
}

test.describe('GET /v2/media-languages/[languageId]', () => {
  test('returns basic media language', async ({ request }) => {
    const response = await getMediaLanguage(request, {
      languageId: '529',
      params: {}
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data).toMatchObject({
      languageId: 529,
      iso3: 'eng',
      bcp47: 'en',
      counts: {
        speakerCount: {
          value: expect.any(Number),
          description: 'Number of speakers'
        },
        countriesCount: {
          value: expect.any(Number),
          description: 'Number of countries'
        },
        series: {
          value: expect.any(Number),
          description: 'Series'
        },
        featureFilm: {
          value: expect.any(Number),
          description: 'Feature Film'
        },
        shortFilm: {
          value: expect.any(Number),
          description: 'Short Film'
        }
      },
      audioPreview: {
        url: expect.any(String),
        audioBitrate: expect.any(Number),
        audioContainer: expect.any(String),
        sizeInBytes: expect.any(Number)
      },
      primaryCountryId: 'GB',
      name: 'English',
      nameNative: 'English',
      alternateLanguageName: '',
      alternateLanguageNameNative: '',
      metadataLanguageTag: 'en',
      _links: {
        self: { href: expect.any(String) }
      }
    })
  })

  test('handles metadata language tags', async ({ request }) => {
    const response = await getMediaLanguage(request, {
      languageId: '529',
      params: { metadataLanguageTags: 'es' }
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.metadataLanguageTag).toBe('es')
  })

  test('returns 404 for non-existent language', async ({ request }) => {
    const response = await getMediaLanguage(request, {
      languageId: '999999',
      params: {}
    })

    expect(response.ok()).toBeFalsy()
    expect(response.status()).toBe(404)
    const data = await response.json()
    expect(data).toMatchObject({
      message: expect.stringContaining('not found'),
      logref: 404
    })
  })

  test('returns 200 and defaults to english for invalid metadata language', async ({
    request
  }) => {
    const response = await getMediaLanguage(request, {
      languageId: '529',
      params: { metadataLanguageTags: 'invalid' }
    })

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toMatchObject({
      languageId: 529
    })
  })
})
