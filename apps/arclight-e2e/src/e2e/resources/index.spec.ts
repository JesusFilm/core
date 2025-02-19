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

const traverseObject = (obj: any): any[] =>
  !obj || typeof obj !== 'object'
    ? []
    : [obj].concat(Object.values(obj).flatMap(traverseObject))

test.describe('GET /v2/resources', () => {
  test('returns United States in countries', async ({ request }) => {
    const response = await searchResources(request, { term: 'United' })
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toMatchObject({
      _links: {
        self: {
          href: expect.any(String)
        }
      },
      _embedded: {
        resources: {
          resourceCount: expect.any(Number),
          mediaCountries: expect.any(Array),
          mediaLanguages: expect.any(Array),
          alternateLanguages: expect.any(Array),
          mediaComponents: expect.any(Array)
        }
      }
    })

    const { mediaCountries } = data._embedded.resources
    expect(mediaCountries.length).toBeGreaterThan(0)

    const usCountry = mediaCountries.find(
      (country) =>
        country.countryId === 'US' && country.name === 'United States'
    )
    expect(usCountry).toBeDefined()
    expect(usCountry).toMatchObject({
      countryId: 'US',
      name: 'United States',
      continentName: expect.any(String),
      metadataLanguageTag: 'en',
      longitude: expect.any(Number),
      latitude: expect.any(Number),
      _links: {
        self: {
          href: expect.stringMatching(
            /^http.*\/v2\/media-countries\/US\?apiKey=.*$/
          )
        }
      }
    })
  })

  test('returns English in languages', async ({ request }) => {
    const response = await searchResources(request, { term: 'English' })
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toMatchObject({
      _links: {
        self: {
          href: expect.any(String)
        }
      },
      _embedded: {
        resources: {
          resourceCount: expect.any(Number),
          countryIds: expect.any(Array),
          languageIds: expect.any(Array),
          alternateLanguageIds: expect.any(Array),
          mediaComponentIds: expect.any(Array)
        }
      }
    })

    const { mediaLanguages } = data._embedded.resources
    expect(mediaLanguages.length).toBeGreaterThan(0)

    const english = mediaLanguages.find(
      (lang) => lang.languageId === 529 && lang.name === 'English'
    )
    expect(english).toBeDefined()
    expect(english).toMatchObject({
      languageId: 529,
      iso3: 'eng',
      bcp47: 'en',
      primaryCountryId: 'GB',
      name: 'English',
      nameNative: 'English',
      metadataLanguageTag: 'en',
      _links: {
        self: {
          href: expect.stringMatching(
            /^http.*\/v2\/media-languages\/529\?apiKey=.*$/
          )
        }
      }
    })
  })

  test('search returns Paper Hats in videos', async ({ request }) => {
    const response = await searchResources(request, {
      term: 'Paper Hats',
      metadataLanguageTags: 'en'
    })
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toMatchObject({
      _links: {
        self: {
          href: expect.any(String)
        }
      },
      _embedded: {
        resources: {
          resourceCount: expect.any(Number),
          countryIds: expect.any(Array),
          languageIds: expect.any(Array),
          alternateLanguageIds: expect.any(Array),
          mediaComponentIds: expect.any(Array)
        }
      }
    })

    const { mediaComponents } = data._embedded.resources
    expect(mediaComponents.length).toBeGreaterThan(0)

    const paperHatsVideo = mediaComponents.find((video) =>
      video?.title?.toLowerCase().includes('paper hats')
    )
    expect(paperHatsVideo).toBeDefined()
    expect(paperHatsVideo).toMatchObject({
      mediaComponentId: expect.any(String),
      componentType: expect.any(String),
      subType: expect.any(String),
      contentType: 'video',
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
      downloadSizes: {
        approximateSmallDownloadSizeInBytes: expect.any(Number),
        approximateLargeDownloadSizeInBytes: expect.any(Number)
      },
      bibleCitations: expect.any(Array),
      primaryLanguageId: expect.any(Number),
      title: expect.stringContaining('Paper Hats'),
      shortDescription: expect.any(String),
      longDescription: expect.any(String),
      studyQuestions: expect.any(Array),
      metadataLanguageTag: 'en'
    })

    // Verify image URLs are properly formatted
    const { imageUrls } = paperHatsVideo
    Object.entries(imageUrls as Record<string, string>).forEach(
      ([key, url]) => {
        expect(typeof url).toBe('string')
        expect(url.startsWith('https://')).toBeTruthy()
        if (key === 'mobileCinematicVeryLow') {
          expect(url).toContain('webp')
        } else {
          expect(url).toContain('jpg')
        }
      }
    )

    expect(paperHatsVideo.bibleCitations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          osisBibleBook: expect.any(String),
          chapterStart: expect.any(Number),
          verseStart: expect.any(Number),
          chapterEnd: expect.any(Number) || null,
          verseEnd: expect.any(Number) || null
        })
      ])
    )
  })
})
