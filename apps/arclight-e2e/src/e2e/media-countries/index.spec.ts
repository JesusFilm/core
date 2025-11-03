import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

async function getMediaCountries(
  request: APIRequestContext,
  params: Record<string, any>
) {
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-countries?${queryParams}`
  )
  return response
}

test.describe('GET /v2/media-countries', () => {
  test('returns basic media countries list', async ({ request }) => {
    const response = await getMediaCountries(request, {
      ids: ['US']
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    const unitedStates = data._embedded.mediaCountries[0]

    expect(unitedStates).toMatchObject({
      countryId: 'US',
      name: 'United States',
      continentName: 'North America',
      metadataLanguageTag: 'en',
      longitude: -97,
      latitude: 38,
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

  test('filters by country IDs', async ({ request }) => {
    const response = await getMediaCountries(request, {
      ids: ['US', 'GB']
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    const countryIds = data._embedded.mediaCountries.map(
      (country: { countryId: string }) => country.countryId
    )
    expect(countryIds).toContain('US')
    expect(countryIds).toContain('GB')
    expect(countryIds.length).toBe(2)
  })

  test('expands language IDs', async ({ request }) => {
    const response = await getMediaCountries(request, {
      ids: ['US'],
      expand: 'languageIds'
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    const unitedStates = data._embedded.mediaCountries[0]

    expect(unitedStates.languageIds).toBeDefined()
    expect(Array.isArray(unitedStates.languageIds)).toBeTruthy()
    expect(unitedStates.languageIds.length).toBeGreaterThan(0)
    expect(typeof unitedStates.languageIds[0]).toBe('number')
  })

  test('handles metadata language tags', async ({ request }) => {
    const response = await getMediaCountries(request, {
      ids: ['US'],
      metadataLanguageTags: 'es'
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    const unitedStates = data._embedded.mediaCountries[0]
    expect(unitedStates.metadataLanguageTag).toBe('es')
  })

  test('handles string values for numeric parameters', async ({ request }) => {
    const response = await getMediaCountries(request, {
      ids: ['US'],
      page: '2',
      limit: '1'
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data.page).toBe(2)
    expect(data.limit).toBe(1)
    expect(data._links).toHaveProperty('previous')
    expect(data._embedded.mediaCountries.length).toBeLessThanOrEqual(1)
  })
})
