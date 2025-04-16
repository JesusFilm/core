import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

async function getMediaLanguages(
  request: APIRequestContext,
  params: Record<string, any>
) {
  const queryParams = createQueryParams(params)
  const startTime = Date.now()
  try {
    console.log(
      '[Test] Making request to /v2/media-languages with params:',
      params
    )
    const response = await request.get(
      `${await getBaseUrl()}/v2/media-languages?${queryParams}`,
      {
        timeout: 45000 // 45 second timeout for individual requests
      }
    )
    const duration = Date.now() - startTime
    console.log('[Test] Request completed in', duration, 'ms')

    if (!response.ok()) {
      const text = await response.text()
      console.error(
        '[Test] Request failed with status',
        response.status,
        ':',
        text
      )
    }

    return response
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[Test] Request failed after', duration, 'ms:', error)
    throw error
  }
}

test.describe('GET /v2/media-languages', () => {
  test.setTimeout(60000) // 60 second timeout for all tests

  // Verify API health before running tests
  test.beforeAll(async ({ request }) => {
    console.log('[Test] Starting media-languages test suite')
    try {
      const healthCheck = await request.get(`${await getBaseUrl()}/health`, {
        timeout: 10000
      })
      if (!healthCheck.ok()) {
        console.error('[Test] Health check failed:', await healthCheck.text())
      } else {
        console.log('[Test] Health check passed')
      }
    } catch (error) {
      console.error('[Test] Health check failed with error:', error)
    }

    // Warmup request
    try {
      console.log('[Test] Making warmup request')
      const warmupStart = Date.now()
      await getMediaLanguages(request, { ids: ['529'] })
      const warmupDuration = Date.now() - warmupStart
      console.log(`[Test] Warmup request completed in ${warmupDuration}ms`)
    } catch (error) {
      console.warn('[Test] Warmup request failed:', error)
    }
  })

  test('returns basic media languages list', async ({ request }) => {
    test.slow() // Mark as potentially slow test

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
    test.slow() // Mark as potentially slow test

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
