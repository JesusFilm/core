import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

async function getMediaCountryLinks(
  request: APIRequestContext,
  params: Record<string, any>
) {
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-country-links?${queryParams}`
  )
  return response
}

test.describe('GET /v2/media-country-links', () => {
  test('returns basic media country links', async ({ request }) => {
    const response = await getMediaCountryLinks(request, {
      ids: ['US', 'GB']
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    expect(data).toMatchObject({
      _embedded: {
        mediaCountriesLinks: expect.any(Array)
      },
      _links: {
        self: { href: expect.any(String) }
      }
    })

    // Validate each media country link
    data._embedded.mediaCountriesLinks.forEach((link: any) => {
      expect(link).toMatchObject({
        countryId: expect.any(String),
        linkedMediaLanguages: {
          suggested: expect.any(Array),
          spoken: expect.any(Array)
        }
      })

      // Validate suggested languages structure
      link.linkedMediaLanguages.suggested.forEach((language: any) => {
        expect(language).toMatchObject({
          languageId: expect.any(Number),
          languageRank: expect.any(Number)
        })
      })

      // Validate spoken languages structure
      link.linkedMediaLanguages.spoken.forEach((language: any) => {
        expect(language).toMatchObject({
          languageId: expect.any(Number),
          speakerCount: expect.any(Number)
        })
      })
    })
  })
})
