import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

async function getMediaLanguages(
  request: APIRequestContext,
  params: Record<string, any>
) {
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-languages?${queryParams}`
  )
  return response
}

test.describe('GET /v2/media-languages', () => {
  test('returns basic media languages list', async ({ request }) => {
    const response = await getMediaLanguages(request, {
      ids: ['529']
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data).toMatchObject({
      page: 1,
      limit: 10,
      pages: 1,
      total: 1,
      _links: {
        self: { href: expect.any(String) },
        first: { href: expect.any(String) },
        last: { href: expect.any(String) }
      },
      _embedded: {
        mediaLanguages: [
          {
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
            metadataLanguageTag: 'en',
            _links: {
              self: { href: expect.any(String) }
            }
          }
        ]
      }
    })
  })

  test('filters by language IDs', async ({ request }) => {
    const response = await getMediaLanguages(request, {
      ids: ['529', '496']
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    const languageIds = data._embedded.mediaLanguages.map(
      (language: { languageId: number }) => language.languageId
    )
    expect(languageIds).toContain(529)
    expect(languageIds).toContain(496)
    expect(languageIds.length).toBe(2)
  })

  test('filters by BCP47 codes', async ({ request }) => {
    const response = await getMediaLanguages(request, {
      bcp47: ['en']
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    const languages = data._embedded.mediaLanguages
    expect(languages.length).toBeGreaterThan(0)
    const english = languages.find(
      (l: { languageId: number }) => l.languageId === 529
    )
    expect(english).toBeDefined()
    expect(english?.bcp47).toBe('en')
  })

  test('filters by ISO3 codes', async ({ request }) => {
    const response = await getMediaLanguages(request, {
      iso3: ['eng']
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    const languages = data._embedded.mediaLanguages
    expect(languages.length).toBeGreaterThan(0)
    const english = languages.find(
      (l: { languageId: number }) => l.languageId === 529
    )
    expect(english).toBeDefined()
    expect(english?.iso3).toBe('eng')
  })

  test('searches by term', async ({ request }) => {
    const response = await getMediaLanguages(request, {
      term: 'English'
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data._embedded.mediaLanguages.length).toBeGreaterThan(0)
    const english = data._embedded.mediaLanguages.find(
      (l: { languageId: number }) => l.languageId === 529
    )
    expect(english).toBeDefined()
    expect(english?.name).toBe('English')
  })

  test('handles metadata language tags', async ({ request }) => {
    const response = await getMediaLanguages(request, {
      ids: ['529'],
      metadataLanguageTags: 'es'
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    const english = data._embedded.mediaLanguages[0]
    expect(english.languageId).toBe(529)
    expect(english.metadataLanguageTag).toBe('es')
  })

  test('handles string values for numeric parameters', async ({ request }) => {
    const response = await getMediaLanguages(request, {
      page: '2',
      limit: '3'
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.page).toBe(2)
    expect(data.limit).toBe(3)
    expect(data._embedded.mediaLanguages.length).toBeLessThanOrEqual(3)

    // Verify pagination links are correct
    expect(data._links).toHaveProperty('previous')
    expect(data._links.previous.href).toContain('page=1')
  })
})
