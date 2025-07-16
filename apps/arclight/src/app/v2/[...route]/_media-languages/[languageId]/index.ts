import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from '@core/shared/gql'
import { HTTPException } from 'hono/http-exception'

import { getApolloClient } from '../../../../../lib/apolloClient'
import { generateCacheKey, getWithStaleCache } from '../../../../../lib/cache'
import { getLanguageIdsFromTags } from '../../../../../lib/getLanguageIdsFromTags'

const GET_LANGUAGE = graphql(`
  query GetLanguage(
    $id: ID!
    $metadataLanguageId: ID
    $fallbackLanguageId: ID
  ) {
    language(id: $id, idType: databaseId) {
      id
      iso3
      bcp47
      name(languageId: $metadataLanguageId) {
        value
        primary
        language {
          bcp47
        }
      }
      fallbackName: name(languageId: $fallbackLanguageId) {
        value
        primary
      }
      nameNative: name {
        value
        primary
      }
      audioPreview {
        size
        value
        duration
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
  metadataLanguageTags: z
    .string()
    .optional()
    .describe('Filter by metadata language tags'),
  apiKey: z.string().optional().describe('API key')
})

const ResponseSchema = z.object({
  languageId: z.number(),
  iso3: z.string(),
  bcp47: z.string(),
  counts: z.object({
    speakerCount: z.object({
      value: z.number(),
      description: z.string()
    }),
    countriesCount: z.object({
      value: z.number(),
      description: z.string()
    }),
    series: z.object({
      value: z.number(),
      description: z.string()
    }),
    featureFilm: z.object({
      value: z.number(),
      description: z.string()
    }),
    shortFilm: z.object({
      value: z.number(),
      description: z.string()
    })
  }),
  audioPreview: z
    .object({
      url: z.string(),
      audioBitrate: z.number(),
      audioContainer: z.string(),
      sizeInBytes: z.number()
    })
    .nullable(),
  primaryCountryId: z.string(),
  name: z.string(),
  nameNative: z.string(),
  alternateLanguageName: z.string(),
  alternateLanguageNameNative: z.string(),
  metadataLanguageTag: z.string(),
  _links: z.object({
    self: z.object({
      href: z.string()
    })
  })
})

const route = createRoute({
  method: 'get',
  path: '/',
  tags: ['Media Languages'],
  summary: 'Get media language by language ID',
  description: 'Get media language by language ID',
  request: {
    params: z.object({
      languageId: z.string()
    }),
    query: QuerySchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResponseSchema
        }
      },
      description: 'Media language'
    },
    400: {
      description: 'Bad Request'
    },
    404: {
      description: 'Not Found'
    }
  }
})

export const mediaLanguage = new OpenAPIHono()

mediaLanguage.openapi(route, async (c) => {
  const languageId = c.req.param('languageId')
  const metadataLanguageTags =
    c.req.query('metadataLanguageTags')?.split(',') ?? []

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof HTTPException) {
    throw languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

  const queryObject = c.req.query()
  const cacheKey = generateCacheKey([
    'media-language',
    languageId ?? '',
    ...metadataLanguageTags
  ])

  const response = await getWithStaleCache(cacheKey, async () => {
    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_LANGUAGE>
    >({
      query: GET_LANGUAGE,
      variables: {
        id: languageId,
        metadataLanguageId,
        fallbackLanguageId
      }
    })
    const language = data.language

    if (language == null)
      return {
        message: `${languageId}:\n  The requested language ID '${languageId}'not found.\n`,
        logref: 404
      }

    if (
      metadataLanguageTags.length > 0 &&
      language.name[0]?.value == null &&
      language.fallbackName[0]?.value == null
    ) {
      return {
        message: `Unable to generate metadata for media language [${languageId}] acceptable according to metadata language(s) [${metadataLanguageTags.join(',')}]`,
        logref: 406
      }
    }
    const queryString = new URLSearchParams(queryObject).toString()

    return {
      languageId: Number(language.id),
      iso3: language.iso3,
      bcp47: language.bcp47,
      counts: {
        speakerCount: {
          value: language.countryLanguages
            .filter(({ suggested }) => !suggested)
            .reduce((acc, { speakers }) => acc + speakers, 0),
          description: 'Number of speakers'
        },
        countriesCount: {
          value: language.countryLanguages.filter(({ suggested }) => !suggested)
            .length,
          description: 'Number of countries'
        },
        ...(language.labeledVideoCounts.seriesCount > 0 && {
          series: {
            value: language.labeledVideoCounts.seriesCount,
            description: 'Series'
          }
        }),
        ...(language.labeledVideoCounts.featureFilmCount > 0 && {
          featureFilm: {
            value: language.labeledVideoCounts.featureFilmCount,
            description: 'Feature Film'
          }
        }),
        ...(language.labeledVideoCounts.shortFilmCount > 0 && {
          shortFilm: {
            value: language.labeledVideoCounts.shortFilmCount,
            description: 'Short Film'
          }
        })
      },
      audioPreview:
        language.audioPreview != null
          ? {
              url: language.audioPreview.value,
              audioBitrate: language.audioPreview.bitrate,
              audioContainer: language.audioPreview.codec,
              sizeInBytes: language.audioPreview.size
            }
          : null,
      primaryCountryId:
        language.countryLanguages.find(({ primary }) => primary)?.country.id ??
        '',
      name: language.name[0]?.value ?? language.fallbackName[0]?.value ?? '',
      nameNative:
        language.nameNative.find(({ primary }) => primary)?.value ??
        language.name[0]?.value ??
        language.fallbackName[0]?.value ??
        '',
      alternateLanguageName: '',
      alternateLanguageNameNative: '',
      metadataLanguageTag: metadataLanguageTags[0] ?? 'en',
      _links: {
        self: {
          href: `http://api.arclight.org/v2/media-languages/${languageId}?${queryString}`
        }
      }
    }
  })

  if ('message' in response) {
    return c.json(response, response.logref === 406 ? 400 : 404)
  }

  return c.json(response)
})
