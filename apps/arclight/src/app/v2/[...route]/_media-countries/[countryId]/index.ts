import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'

import { ResultOf, graphql } from '@core/shared/gql'

import { getApolloClient } from '../../../../../lib/apolloClient'
import { generateCacheKey, getWithStaleCache } from '../../../../../lib/cache'
import { getLanguageIdsFromTags } from '../../../../../lib/getLanguageIdsFromTags'

interface MediaCountryResponse {
  countryId: string
  name: string
  continentName: string
  metadataLanguageTag: string
  longitude: number | null
  latitude: number | null
  counts: {
    languageCount: { value: number | null; description: string }
    population: { value: number | null; description: string }
    languageHavingMediaCount: { value: number | null; description: string }
  }
  assets: {
    flagUrls: { png8: string | null; webpLossy50: string | null }
  }
  _links: {
    self: { href: string }
  }
  _embedded?: {
    mediaLanguages: Array<{
      languageId: number
      iso3: string | null
      bcp47: string | null
      counts: {
        countrySpeakerCount: { value: number | null; description: string }
      }
      primaryCountryId: string | null
      name: string | undefined
      nameNative: string | undefined
      alternateLanguageName: string
      alternateLanguageNameNative: string
      metadataLanguageTag: string
    }>
  }
}

const GET_COUNTRY = graphql(`
  query GetCountry(
    $id: ID!
    $metadataLanguageId: ID!
    $fallbackLanguageId: ID!
  ) {
    country(id: $id) {
      id
      population
      latitude
      longitude
      flagPngSrc
      flagWebpSrc
      name(languageId: $metadataLanguageId) {
        value
      }
      fallbackName: name(languageId: $fallbackLanguageId) {
        value
      }
      continent {
        name(languageId: $metadataLanguageId) {
          value
        }
        fallbackName: name(languageId: $fallbackLanguageId) {
          value
        }
      }
      countryLanguages {
        displaySpeakers
        primary
        language {
          id
          iso3
          bcp47
          countryLanguages {
            country {
              id
            }
            primary
          }
          name {
            value
            primary
          }
          countryLanguages {
            primary
            country {
              id
            }
          }
        }
        primary
      }
      languageCount
      languageHavingMediaCount
    }
  }
`)

export const mediaCountry = new OpenAPIHono()

const QuerySchema = z.object({
  expand: z.string().optional(),
  metadataLanguageTags: z.string().optional()
})

const ResponseSchema = z.object({
  countryId: z.string(),
  name: z.string(),
  continentName: z.string(),
  metadataLanguageTag: z.string(),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
  counts: z.object({
    languageCount: z.object({
      value: z.number(),
      description: z.string()
    }),
    population: z.object({
      value: z.number(),
      description: z.string()
    }),
    languageHavingMediaCount: z.object({
      value: z.number(),
      description: z.string()
    })
  }),
  assets: z.object({
    flagUrls: z.object({
      png8: z.string().optional(),
      webpLossy50: z.string().optional()
    })
  }),
  _links: z.object({
    self: z.object({
      href: z.string()
    })
  }),
  _embedded: z.object({
    mediaLanguages: z.array(
      z.object({
        languageId: z.number(),
        iso3: z.string().optional(),
        bcp47: z.string().optional()
      })
    )
  })
})

const route = createRoute({
  method: 'get',
  path: '/',
  tags: ['Media Countries'],
  summary: 'Get media country by country id',
  description: 'Get media country by country id',
  request: {
    query: QuerySchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResponseSchema
        }
      },
      description: 'Media country'
    },
    404: {
      description: 'Not found'
    }
  }
})

mediaCountry.openapi(route, async (c) => {
  const countryId = c.req.param('countryId') as string
  const expand = c.req.query('expand')
  const metadataLanguageTags =
    c.req.query('metadataLanguageTags')?.split(',') ?? []

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof HTTPException) {
    throw languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

  const queryObject = c.req.query()
  const cacheKey = generateCacheKey([
    'media-country',
    countryId,
    expand ?? '',
    ...metadataLanguageTags
  ])

  const response = await getWithStaleCache(cacheKey, async () => {
    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_COUNTRY>
    >({
      query: GET_COUNTRY,
      variables: {
        id: countryId,
        metadataLanguageId,
        fallbackLanguageId
      }
    })
    const country = data.country

    if (country == null) {
      return {
        message: `${countryId}:\n  The requested country ID '${countryId}' not found.\n`,
        logref: 404
      }
    }

    const queryString = new URLSearchParams(queryObject).toString()

    const response: MediaCountryResponse = {
      countryId,
      name: country.name?.[0]?.value ?? country.fallbackName?.[0]?.value ?? '',
      continentName:
        country.continent?.name?.[0]?.value ??
        country.continent?.fallbackName?.[0]?.value ??
        '',
      metadataLanguageTag: metadataLanguageTags[0] ?? 'en',
      longitude: country.longitude ? country.longitude : 0,
      latitude: country.latitude ? country.latitude : 0,
      counts: {
        languageCount: {
          value: country.languageCount,
          description: 'Number of spoken languages'
        },
        population: {
          value: country.population,
          description: 'Country population'
        },
        languageHavingMediaCount: {
          value: country.languageHavingMediaCount,
          description: 'Number of languages having media'
        }
      },
      assets: {
        flagUrls: {
          png8: country.flagPngSrc,
          webpLossy50: country.flagWebpSrc
        }
      },
      _links: {
        self: {
          href: `http://api.arclight.org/v2/media-countries/${countryId}?${queryString}`
        }
      }
    }

    if (expand === 'mediaLanguages') {
      response._embedded = {
        mediaLanguages: country.countryLanguages.map((countryLanguage) => ({
          languageId: Number(countryLanguage.language.id),
          iso3: countryLanguage.language.iso3,
          bcp47: countryLanguage.language.bcp47,
          counts: {
            countrySpeakerCount: {
              value: countryLanguage.displaySpeakers,
              description: 'Number of language speakers in country'
            }
          },
          primaryCountryId:
            countryLanguage.language.countryLanguages.find(
              (countryLanguage) => countryLanguage.primary
            )?.country.id ?? '',
          name: countryLanguage.language.name.find(({ primary }) => !primary)
            ?.value,
          nameNative: countryLanguage.language.name.find(
            ({ primary }) => primary
          )?.value,
          alternateLanguageName: '',
          alternateLanguageNameNative: '',
          metadataLanguageTag: 'en'
        }))
      }
    }

    return response
  })

  if ('message' in response) {
    return c.json(response, 404)
  }

  return c.json(response)
})
