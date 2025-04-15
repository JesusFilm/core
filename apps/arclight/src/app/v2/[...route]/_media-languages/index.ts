import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from 'gql.tada'
import { HTTPException } from 'hono/http-exception'
import { timeout } from 'hono/timeout'
import { headers } from 'next/headers'

import { getApolloClient } from '../../../../lib/apolloClient'
import { generateCacheKey, getWithStaleCache } from '../../../../lib/cache'
import { getLanguageIdsFromTags } from '../../../../lib/getLanguageIdsFromTags'

import { mediaLanguage } from './[languageId]'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const GET_LANGUAGES_COUNT = graphql(`
  query GetLanguagesCount(
    $ids: [ID!]
    $bcp47: [String!]
    $iso3: [String!]
    $term: String
  ) {
    languagesCount(
      where: { ids: $ids, bcp47: $bcp47, iso3: $iso3 }
      term: $term
    )
  }
`)

const GET_LANGUAGES_DATA = graphql(`
  query GetLanguagesData(
    $limit: Int!
    $offset: Int!
    $ids: [ID!]
    $bcp47: [String!]
    $iso3: [String!]
    $metadataLanguageId: ID
    $fallbackLanguageId: ID
    $term: String
  ) {
    languages(
      limit: $limit
      offset: $offset
      where: { ids: $ids, bcp47: $bcp47, iso3: $iso3 }
      term: $term
    ) {
      id
      iso3
      bcp47
      name(languageId: $metadataLanguageId) {
        value
        primary
      }
      fallbackName: name(languageId: $fallbackLanguageId) {
        value
        primary
      }
      nameNative: name(primary: true) {
        value
        primary
      }
      audioPreview {
        size
        value
        bitrate
        codec
      }
      countryLanguages {
        country {
          id
        }
        speakers
        primary
        suggested
      }
      labeledVideoCounts {
        seriesCount
        featureFilmCount
        shortFilmCount
      }
    }
  }
`)

const QuerySchema = z.object({
  apiKey: z.string().optional().describe('API key'),
  page: z.coerce.number().optional().describe('Page number'),
  limit: z.coerce.number().optional().describe('Number of items per page'),
  ids: z.string().optional().describe('Filter by language IDs'),
  bcp47: z.string().optional().describe('Filter by BCP-47 language codes'),
  iso3: z.string().optional().describe('Filter by ISO-3 language codes'),
  metadataLanguageTags: z
    .string()
    .optional()
    .describe('Filter by metadata language tags'),
  term: z.string().optional().describe('Search term'),
  expand: z
    .string()
    .optional()
    .describe('Comma-separated list of fields to expand')
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
    mediaLanguages: z.array(z.object({}))
  })
})

const route = createRoute({
  method: 'get',
  path: '/',
  tags: ['Media Languages'],
  summary: 'Get Language information for all languages that have active media',
  description:
    'Get Language information for all languages that have active media',
  request: {
    query: QuerySchema
  },
  responses: {
    200: {
      content: { 'application/json': { schema: ResponseSchema } },
      description: 'Media languages'
    }
  },
  middleware: [timeout(60000)]
})

export const mediaLanguages = new OpenAPIHono()
mediaLanguages.route('/:languageId', mediaLanguage)

const DEFAULT_LIMIT = 100 // More reasonable default limit
const MAX_LIMIT = 5000 // Maximum allowed limit

mediaLanguages.openapi(route, async (c) => {
  const page = c.req.query('page') == null ? 1 : Number(c.req.query('page'))
  const requestedLimit =
    c.req.query('limit') == null ? DEFAULT_LIMIT : Number(c.req.query('limit'))
  const limit = Math.min(requestedLimit, MAX_LIMIT) // Ensure limit doesn't exceed maximum
  const offset = (page - 1) * limit
  const ids =
    c.req.query('ids')?.split(',').filter(Boolean).length === 0
      ? undefined
      : c.req.query('ids')?.split(',').filter(Boolean)
  const bcp47 =
    c.req.query('bcp47')?.split(',').filter(Boolean).length === 0
      ? undefined
      : c.req.query('bcp47')?.split(',').filter(Boolean)
  const iso3 =
    c.req.query('iso3')?.split(',').filter(Boolean).length === 0
      ? undefined
      : c.req.query('iso3')?.split(',').filter(Boolean)
  const term = c.req.query('term')
  const metadataLanguageTags =
    c.req.query('metadataLanguageTags')?.split(',').filter(Boolean) ?? []
  const expand = c.req.query('expand')?.split(',') ?? []

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof HTTPException) {
    throw languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

  const cacheKey = generateCacheKey([
    'media-languages',
    page.toString(),
    limit.toString(),
    ...(ids ?? []),
    ...(bcp47 ?? []),
    ...(iso3 ?? []),
    term ?? '',
    ...metadataLanguageTags
  ])

  const response = await getWithStaleCache(
    cacheKey,
    async () => {
      // Get total count first
      const countResult = await getApolloClient().query<
        ResultOf<typeof GET_LANGUAGES_COUNT>
      >({
        query: GET_LANGUAGES_COUNT,
        variables: {
          ids,
          bcp47,
          iso3,
          term
        }
      })

      const totalCount = countResult.data.languagesCount

      // Then get paginated data
      const { data } = await getApolloClient().query<
        ResultOf<typeof GET_LANGUAGES_DATA>
      >({
        query: GET_LANGUAGES_DATA,
        variables: {
          limit,
          offset,
          ids,
          bcp47,
          iso3,
          metadataLanguageId,
          fallbackLanguageId,
          term
        }
      })

      const languages = data.languages

      const queryObject = {
        ...c.req.query(),
        page: page.toString(),
        limit: limit.toString()
      }

      const totalPages = Math.ceil(Number(totalCount) / limit)
      const queryString = new URLSearchParams(queryObject).toString()
      const firstQueryString = new URLSearchParams({
        ...queryObject,
        page: '1'
      }).toString()
      const lastQueryString = new URLSearchParams({
        ...queryObject,
        page: totalPages.toString()
      }).toString()
      const nextQueryString = new URLSearchParams({
        ...queryObject,
        page: (page + 1).toString()
      }).toString()
      const previousQueryString = new URLSearchParams({
        ...queryObject,
        page: (page - 1).toString()
      }).toString()

      const mediaLanguages = languages
        .filter(
          (language) =>
            language.name[0]?.value != null ||
            language.fallbackName[0]?.value != null
        )
        .map((language) => {
          const nonSuggestedCountryLanguages = language.countryLanguages.filter(
            ({ suggested }) => !suggested
          )

          const speakerCount = nonSuggestedCountryLanguages.reduce(
            (acc, { speakers }) => acc + speakers,
            0
          )

          const countriesCount = nonSuggestedCountryLanguages.length

          const primaryCountry = nonSuggestedCountryLanguages.find(
            ({ primary }) => primary
          )

          // Base response with required fields
          const baseResponse = {
            languageId: Number(language.id),
            iso3: language.iso3,
            bcp47: language.bcp47,
            name:
              language.name[0]?.value ?? language.fallbackName[0]?.value ?? '',
            nameNative: language.nameNative[0]?.value ?? '',
            metadataLanguageTag:
              language.name[0]?.language?.bcp47 ??
              language.fallbackName[0]?.language?.bcp47 ??
              'en',
            _links: {
              self: {
                href: `http://api.arclight.org/v2/media-languages/${language.id}`
              }
            }
          }

          // Add optional fields based on expand parameter
          if (expand.includes('counts')) {
            Object.assign(baseResponse, {
              counts: {
                speakerCount: {
                  value: speakerCount,
                  description: `${speakerCount.toLocaleString()} speakers`
                },
                countriesCount: {
                  value: countriesCount,
                  description: `${countriesCount} ${
                    countriesCount === 1 ? 'country' : 'countries'
                  }`
                },
                series: {
                  value: language.labeledVideoCounts?.seriesCount ?? 0,
                  description: `${
                    language.labeledVideoCounts?.seriesCount ?? 0
                  } series`
                },
                featureFilm: {
                  value: language.labeledVideoCounts?.featureFilmCount ?? 0,
                  description: `${
                    language.labeledVideoCounts?.featureFilmCount ?? 0
                  } feature films`
                },
                shortFilm: {
                  value: language.labeledVideoCounts?.shortFilmCount ?? 0,
                  description: `${
                    language.labeledVideoCounts?.shortFilmCount ?? 0
                  } short films`
                }
              }
            })
          }

          if (expand.includes('audioPreview') && language.audioPreview) {
            Object.assign(baseResponse, {
              audioPreview: {
                url: language.audioPreview.value,
                audioBitrate: language.audioPreview.bitrate,
                audioContainer: language.audioPreview.codec,
                sizeInBytes: language.audioPreview.size
              }
            })
          }

          if (expand.includes('primaryCountry')) {
            Object.assign(baseResponse, {
              primaryCountryId: primaryCountry?.country.id
            })
          }

          return baseResponse
        })

      return {
        page,
        limit,
        pages: totalPages,
        total: Number(totalCount),
        _links: {
          self: {
            href: `http://api.arclight.org/v2/media-languages?${queryString}`
          },
          first: {
            href: `http://api.arclight.org/v2/media-languages?${firstQueryString}`
          },
          last: {
            href: `http://api.arclight.org/v2/media-languages?${lastQueryString}`
          },
          ...(page < totalPages && {
            next: {
              href: `http://api.arclight.org/v2/media-languages?${nextQueryString}`
            }
          }),
          ...(page > 1 && {
            previous: {
              href: `http://api.arclight.org/v2/media-languages?${previousQueryString}`
            }
          })
        },
        _embedded: {
          mediaLanguages
        }
      }
    },
    {
      ttl: 24 * 3600, // 24 hours
      staleWhileRevalidate: true
    }
  )

  return c.json(response)
})
