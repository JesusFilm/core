import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

async function searchResources(
  request: APIRequestContext,
  params: Record<string, any>
) {
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/resources?${queryParams}`
  )
  return response
}

test.describe('GET /v2/resources', () => {
  test('returns United States in countries', async ({ request }) => {
    const response = await searchResources(request, { term: 'United' })
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      _links: {
        self: {
          href: expect.stringMatching(
            /\/v2\/resources\?term=United&bulk=false&apiKey=.+/
          )
        }
      },
      _embedded: {
        resources: {
          mediaCountries: expect.arrayContaining([
            {
              countryId: 'US',
              name: 'United States',
              continentName: 'North America',
              metadataLanguageTag: 'en',
              longitude: -97,
              latitude: 38,
              _links: {
                self: {
                  href: expect.stringMatching(
                    /\/v2\/media-countries\/US\?apiKey=.+/
                  )
                }
              }
            }
          ])
        }
      }
    })

    const countries = data._embedded.resources.mediaCountries
    const usCountry = countries.find(
      (country: any) => country.countryId === 'US'
    )
    expect(usCountry).toBeDefined()
  })

  test('returns English in languages', async ({ request }) => {
    const response = await searchResources(request, { term: 'English' })
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      _links: {
        self: {
          href: expect.stringMatching(
            /\/v2\/resources\?term=English&bulk=false&apiKey=.+/
          )
        }
      },
      _embedded: {
        resources: {
          mediaLanguages: expect.arrayContaining([
            {
              languageId: 529,
              name: 'English',
              nameNative: 'English',
              metadataLanguageTag: 'en',
              bcp47: 'en',
              iso3: 'eng',
              primaryCountryId: 'GB',
              _links: {
                self: {
                  href: expect.stringMatching(
                    /\/v2\/media-languages\/529\?apiKey=.+/
                  )
                }
              }
            }
          ])
        }
      }
    })

    const languages = data._embedded.resources.mediaLanguages
    const englishLanguage = languages.find(
      (language: any) => language.languageId === 529
    )
    expect(englishLanguage).toBeDefined()
  })

  test.fixme('search returns Paper Hats in videos', async ({ request }) => {
    // Skipped because Algolia integration is not ready
    const response = await searchResources(request, {
      term: 'Paper Hats',
      metadataLanguageTags: 'en'
    })
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      _embedded: {
        resources: {
          mediaComponents: expect.any(Array)
        }
      }
    })

    const videos = data._embedded.resources.mediaComponents
    const paperHatsVideo = videos.find((video: any) =>
      video.title.toLowerCase().includes('paper hats')
    )

    expect(paperHatsVideo).toBeDefined()
    expect(paperHatsVideo).toMatchObject({
      mediaComponentId: expect.any(String),
      title: expect.stringContaining('Paper Hats'),
      _links: expect.any(Object)
    })
  })
})
