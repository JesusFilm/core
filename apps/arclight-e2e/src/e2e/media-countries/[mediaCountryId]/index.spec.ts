import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../../framework/helpers'

interface TestCase {
  countryId: string
  params: Record<string, any>
}

async function getMediaCountry(request: APIRequestContext, testCase: TestCase) {
  const { countryId, params } = testCase
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-countries/${countryId}?${queryParams}`
  )
  return response
}

test.describe('GET /v2/media-countries/[countryId]', () => {
  test('returns basic media country', async ({ request }) => {
    const response = await getMediaCountry(request, {
      countryId: 'US',
      params: {}
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data).toMatchObject({
      countryId: 'US',
      name: expect.any(String),
      continentName: expect.any(String),
      metadataLanguageTag: expect.any(String),
      longitude: expect.any(Number),
      latitude: expect.any(Number),
      counts: {
        languageCount: {
          value: expect.any(Number),
          description: expect.any(String)
        },
        population: {
          value: expect.any(Number),
          description: expect.any(String)
        },
        languageHavingMediaCount: {
          value: expect.any(Number),
          description: expect.any(String)
        }
      },
      assets: {
        flagUrls: {
          png8: expect.any(String),
          webpLossy50: expect.any(String)
        }
      },
      _links: {
        self: { href: expect.any(String) }
      }
    })
  })

  test('expands media languages', async ({ request }) => {
    const response = await getMediaCountry(request, {
      countryId: 'AD',
      params: { expand: 'mediaLanguages' }
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data._embedded?.mediaLanguages).toBeDefined()
    expect(Array.isArray(data._embedded.mediaLanguages)).toBeTruthy()
    expect(data._embedded.mediaLanguages.length).toBeGreaterThan(0)

    const firstLanguage = data._embedded.mediaLanguages[0]
    expect(firstLanguage).toMatchObject({
      languageId: expect.any(Number),
      iso3: expect.any(String),
      bcp47: expect.any(String),
      counts: {
        countrySpeakerCount: {
          value: expect.any(Number),
          description: expect.any(String)
        }
      },
      primaryCountryId: expect.any(String),
      name: expect.any(String),
      nameNative: expect.any(String),
      alternateLanguageName: expect.any(String),
      alternateLanguageNameNative: expect.any(String),
      metadataLanguageTag: expect.any(String)
    })
  })

  test('handles metadata language tags', async ({ request }) => {
    const response = await getMediaCountry(request, {
      countryId: 'AD',
      params: { metadataLanguageTags: 'es' }
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.metadataLanguageTag).toBe('es')
  })
})
