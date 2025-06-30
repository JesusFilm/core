import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from 'gql.tada'
import { HTTPException } from 'hono/http-exception'

import { getApolloClient } from '../../../../lib/apolloClient'
import { generateCacheKey, getWithStaleCache } from '../../../../lib/cache'
import { getLanguageIdsFromTags } from '../../../../lib/getLanguageIdsFromTags'

import { mediaCountry } from './[countryId]'

const GET_COUNTRIES = graphql(`
  query Country(
    $metadataLanguageId: ID!
    $fallbackLanguageId: ID!
    $ids: [ID!]
  ) {
    countries(ids: $ids) {
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
        language {
          id
        }
      }
      languageCount
      languageHavingMediaCount
    }
  }
`)

export const mediaCountries = new OpenAPIHono()
mediaCountries.route('/:countryId', mediaCountry)

const QuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  ids: z.string().optional(),
  expand: z.string().optional(),
  metadataLanguageTags: z.string().optional()
})

const ResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  pages: z.number(),
  total: z.number(),
  _links: z.object({
    self: z.object({
      href: z.string()
    }),
    first: z.object({
      href: z.string()
    }),
    last: z.object({
      href: z.string()
    }),
    next: z
      .object({
        href: z.string()
      })
      .optional(),
    previous: z
      .object({
        href: z.string()
      })
      .optional()
  }),
  _embedded: z.object({
    mediaCountries: z.array(
      z.object({
        countryId: z.string(),
        name: z.string(),
        continentName: z.string(),
        metadataLanguageTag: z.string(),
        longitude: z.number(),
        latitude: z.number(),
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
            png8: z.string().nullable(),
            webpLossy50: z.string().nullable()
          })
        }),
        _links: z.object({
          self: z.object({
            href: z.string()
          })
        })
      })
    )
  })
})

const route = createRoute({
  method: 'get',
  path: '/',
  tags: ['Media Countries'],
  summary: 'Get media countries',
  description: 'Get media countries',
  request: { query: QuerySchema },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResponseSchema
        }
      },
      description: 'Media countries'
    }
  }
})

mediaCountries.openapi(route, async (c) => {
  const page = c.req.query('page') ? Number(c.req.query('page')) : 1
  const limit = c.req.query('limit') ? Number(c.req.query('limit')) : 10
  const idsParam = c.req.query('ids')
  const ids = idsParam ? idsParam.split(',') : undefined
  const expand = c.req.query('expand')
  const offset = (page - 1) * limit
  const metadataLanguageTags =
    c.req.query('metadataLanguageTags')?.split(',') ?? []

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof HTTPException) {
    throw languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

  const queryObject = {
    ...c.req.query(),
    page: page.toString(),
    limit: limit.toString()
  }

  const cacheKey = generateCacheKey([
    'media-countries',
    page.toString(),
    limit.toString(),
    ...(ids ?? []),
    expand ?? '',
    ...metadataLanguageTags
  ])

  const response = await getWithStaleCache(cacheKey, async () => {
    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_COUNTRIES>
    >({
      query: GET_COUNTRIES,
      variables: {
        ids,
        metadataLanguageId,
        fallbackLanguageId
      }
    })

    const queryString = new URLSearchParams(queryObject).toString()
    const firstQueryString = new URLSearchParams({
      ...queryObject,
      page: '1'
    }).toString()
    const lastQueryString = new URLSearchParams({
      ...queryObject,
      page: Math.ceil(data.countries.length / limit).toString()
    }).toString()
    const nextQueryString = new URLSearchParams({
      ...queryObject,
      page: (page + 1).toString()
    }).toString()
    const previousQueryString = new URLSearchParams({
      ...queryObject,
      page: (page - 1).toString()
    }).toString()

    const mediaCountries = data.countries
      .slice(offset, offset + limit)
      .filter(
        (country) =>
          country.name[0]?.value != null ||
          country.fallbackName[0]?.value != null
      )
      .map((country) => ({
        countryId: country.id,
        name: country.name[0]?.value ?? country.fallbackName?.[0]?.value ?? '',
        continentName:
          country.continent?.name[0]?.value ??
          country.continent?.fallbackName[0]?.value ??
          '',
        metadataLanguageTag: metadataLanguageTags[0] ?? 'en',
        longitude: country.longitude ? country.longitude : 0,
        latitude: country.latitude ? country.latitude : 0,
        counts: {
          languageCount: {
            value: country.languageCount ?? 0,
            description: 'Number of spoken languages'
          },
          population: {
            value: country.population ?? 0,
            description: 'Country population'
          },
          languageHavingMediaCount: {
            value: country.languageHavingMediaCount ?? 0,
            description: 'Number of languages having media'
          }
        },
        assets: {
          flagUrls: {
            png8: country.flagPngSrc,
            webpLossy50: country.flagWebpSrc
          }
        },
        ...(expand === 'languageIds'
          ? {
              languageIds: country.countryLanguages.map((countryLanguage) =>
                Number(countryLanguage.language.id)
              )
            }
          : {}),
        _links: {
          self: {
            href: `http://api.arclight.org/v2/media-countries/${country.id}?apiKey=${process.env.API_KEY}`
          }
        }
      }))

    const totalCountries = data.countries.length
    const totalPages = Math.ceil(totalCountries / limit)

    return {
      page,
      limit,
      pages: totalPages,
      total: totalCountries,
      _links: {
        self: {
          href: `http://api.arclight.org/v2/media-countries?${queryString}`
        },
        first: {
          href: `http://api.arclight.org/v2/media-countries?${firstQueryString}`
        },
        last: {
          href: `http://api.arclight.org/v2/media-countries?${lastQueryString}`
        },
        next:
          page < totalPages
            ? {
                href: `http://api.arclight.org/v2/media-countries?${nextQueryString}`
              }
            : undefined,
        previous:
          page > 1
            ? {
                href: `http://api.arclight.org/v2/media-countries?${previousQueryString}`
              }
            : undefined
      },
      _embedded: {
        mediaCountries
      }
    }
  })

  return c.json(response)
})
