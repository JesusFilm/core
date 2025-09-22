import { OpenAPIHono, RouteConfig, createRoute } from '@hono/zod-openapi'
import { SearchClient, algoliasearch } from 'algoliasearch'
import { z } from 'zod'

type AlgoliaVideoHit = {
  mediaComponentId: string
  componentType: string
  subType?: string
  contentType: string
  lengthInMilliseconds?: number
  imageUrls: {
    thumbnail?: string
    videoStill?: string
    mobileCinematicHigh?: string
    mobileCinematicLow?: string
    mobileCinematicVeryLow?: string
  }
  titles: Array<{
    value: string
    languageId: string
    bcp47: string
  }>
  descriptions: Array<{
    value: string
    languageId: string
    bcp47: string
  }>
  studyQuestions: Array<{
    value: string
    languageId: string
    bcp47: string
  }>
  isDownloadable: boolean
  downloadSizes?: {
    approximateSmallDownloadSizeInBytes?: number
    approximateLargeDownloadSizeInBytes?: number
  }
  bibleCitations?: Array<{
    osisBibleBook: string
    chapterStart: number | null
    verseStart: number | null
    chapterEnd: number | null
    verseEnd: number | null
  }>
  primaryLanguageId: number
  containsCount: number
}

type AlgoliaLanguageHit = {
  objectID: string
  languageId: number
  iso3: string
  bcp47: string
  primaryCountryId: string
  nameNative: string
  names: Array<{
    value: string
    languageId: string
    bcp47: string
  }>
  speakersCount: number
}

type AlgoliaCountryHit = {
  objectID: string
  countryId: string
  names: Array<{
    value: string
    languageId: string
    bcp47: string
  }>
  continentName: string
  longitude: number
  latitude: number
}

type AlgoliaSearchResponse<T> = {
  hits: T[]
}

async function initAlgoliaClient() {
  const appID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
  const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY

  if (!appID || !apiKey) {
    throw new Error('Algolia environment variables are not set')
  }

  return algoliasearch(appID, apiKey)
}

async function searchVideoVariantsAlgolia(
  term: string,
  metadataLanguageTags: string[],
  client: SearchClient
): Promise<AlgoliaVideoHit[]> {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_VIDEOS
  if (!indexName) {
    throw new Error('Algolia environment variables are not set')
  }

  const response = (await client.searchSingleIndex<AlgoliaVideoHit>({
    indexName,
    searchParams: {
      query: term,
      attributesToRetrieve: [
        'mediaComponentId',
        'componentType',
        'subType',
        'contentType',
        'imageUrls',
        'lengthInMilliseconds',
        'containsCount',
        'isDownloadable',
        'downloadSizes',
        'bibleCitations',
        'primaryLanguageId',
        'titles',
        'descriptions',
        'studyQuestions'
      ],
      ruleContexts: ['arclight_resources_page'],
      filters:
        'published:true AND NOT restrictViewPlatforms:arclight AND hasAvailableLanguages:true'
    }
  })) as AlgoliaSearchResponse<AlgoliaVideoHit>

  if (!response.hits) {
    return []
  }

  return response.hits
}

async function searchAlgoliaLanguages(
  term: string,
  metadataLanguageTags: string[],
  client: SearchClient
) {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_LANGUAGES
  if (!indexName) {
    throw new Error('Algolia environment variables are not set')
  }

  const facets = []
  for (const tag of metadataLanguageTags) {
    facets.push(`names.bcp47:${tag}`)
  }
  const response = await client.searchSingleIndex<AlgoliaLanguageHit>({
    indexName,
    searchParams: {
      query: term,
      hitsPerPage: 1000,
      facets: metadataLanguageTags.length > 0 ? ['names.bcp47'] : [],
      ...(metadataLanguageTags.length > 0 && {
        facetFilters: facets
      }),
      maxValuesPerFacet: 100,
      attributesToRetrieve: [
        'objectID',
        'languageId',
        'iso3',
        'bcp47',
        'primaryCountryId',
        'nameNative',
        'names',
        'speakersCount'
      ],
      ruleContexts: ['arclight_resources_page']
    }
  })

  if (!response.hits) {
    return []
  }

  return response.hits.map((hit) => ({
    objectID: hit.objectID,
    languageId: hit.languageId,
    iso3: hit.iso3,
    bcp47: hit.bcp47,
    primaryCountryId: hit.primaryCountryId,
    nameNative: hit.nameNative,
    names: hit.names
  }))
}

async function searchAlgoliaCountries(
  term: string,
  metadataLanguageTags: string[],
  client: SearchClient
) {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_COUNTRIES
  if (!indexName) {
    throw new Error('Algolia environment variables are not set')
  }

  const facets = []
  for (const tag of metadataLanguageTags) {
    facets.push(`names.bcp47:${tag}`)
  }

  const response = await client.searchSingleIndex<AlgoliaCountryHit>({
    indexName,
    searchParams: {
      query: term,
      hitsPerPage: 1000,
      facets: metadataLanguageTags.length > 0 ? ['names.bcp47'] : [],
      ...(metadataLanguageTags.length > 0 && {
        facetFilters: facets
      }),
      ruleContexts: ['arclight_resources_page']
    }
  })

  return response.hits ?? []
}

const QuerySchema = z.object({
  term: z.string().describe('Search term for resources - cannot be empty'),
  bulk: z.string().optional().describe('If true, only returns ids and links'),
  metadataLanguageTags: z
    .string()
    .optional()
    .describe(
      'Comma-separated list of metadata language tags. ( bcp47 codes in core )'
    ),
  apiKey: z.string().optional().describe('API key for authentication')
})

const ErrorResponseSchema = z.object({
  message: z.string().describe('Error message'),
  logref: z.number().describe('Error reference code')
})

const VideoSchema = z.object({
  mediaComponentId: z
    .string()
    .describe('Unique identifier for the media component. ( videoId in core )'),
  componentType: z
    .string()
    .describe('Type of the component. ( content or container )'),
  subType: z
    .string()
    .optional()
    .describe(
      'Subtype of the component. ( collection, episode, featureFilm, segment, series, shortFilm )'
    ),
  contentType: z.string().describe('Content type. ( video or none )'),
  imageUrls: z
    .object({
      thumbnail: z.string().optional(),
      videoStill: z.string().optional(),
      mobileCinematicHigh: z.string().optional(),
      mobileCinematicLow: z.string().optional(),
      mobileCinematicVeryLow: z.string().optional()
    })
    .describe('URLs for various image formats'),
  lengthInMilliseconds: z
    .number()
    .describe('Duration of the media in milliseconds'),
  containsCount: z.number().describe('Number of contained items'),
  isDownloadable: z.boolean().describe('Whether the media can be downloaded'),
  downloadSizes: z
    .object({
      approximateSmallDownloadSizeInBytes: z.number().optional(),
      approximateLargeDownloadSizeInBytes: z.number().optional()
    })
    .optional()
    .describe('Download size information'),
  bibleCitations: z
    .array(
      z.object({
        osisBibleBook: z.string(),
        chapterStart: z.number().nullable(),
        verseStart: z.number().nullable(),
        chapterEnd: z.number().nullable(),
        verseEnd: z.number().nullable()
      })
    )
    .optional()
    .describe('Bible citations'),
  primaryLanguageId: z.number().describe('Primary language id'),
  studyQuestions: z.array(z.string()).optional().describe('Study questions'),
  languageIds: z.array(z.number()).optional().describe('Language ids')
})

const CountrySchema = z.object({
  countryId: z.string(),
  name: z.string(),
  continentName: z.string(),
  longitude: z.number(),
  latitude: z.number()
})

const LanguageSchema = z.object({
  languageId: z.number(),
  iso3: z.string(),
  bcp47: z.string(),
  primaryCountryId: z.string(),
  nameNative: z.string(),
  name: z.string()
})

const ResourcesResponseSchema = z.object({
  _links: z.object({
    self: z.object({
      href: z.string().url()
    })
  }),
  _embedded: z.object({
    resources: z.object({
      resourceCount: z.number(),
      mediaComponents: z.array(VideoSchema).optional(),
      mediaCountries: z.array(CountrySchema).optional(),
      mediaLanguages: z.array(LanguageSchema).optional(),
      alternateLanguages: z.array(z.unknown()).optional(),
      countryIds: z.array(z.string()).optional(),
      languageIds: z.array(z.number()).optional(),
      alternateLanguageIds: z.array(z.unknown()).optional(),
      mediaComponentIds: z.array(z.string()).optional()
    })
  })
})

const searchRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Resources'],
  summary: 'Search for resources',
  description:
    'Search across media components, countries, and languages using Algolia search',
  request: {
    query: QuerySchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResourcesResponseSchema
        }
      },
      description: 'Successful search results'
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      },
      description: 'Bad Request - Empty search term'
    },
    403: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      },
      description: 'Algolia API Error'
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      },
      description: 'Internal Server Error'
    }
  }
}) satisfies RouteConfig

export const resources = new OpenAPIHono()

resources.openapi(searchRoute, async (c) => {
  const apiKey = c.req.query('apiKey') ?? ''
  const term = c.req.query('term')
  const bulk = c.req.query('bulk') ?? 'false'
  const metadataLanguageTags =
    c.req.query('metadataLanguageTags')?.split(',') ?? []

  if (!term || term === '') {
    return c.json(
      {
        message:
          'Parameter "term" of value "" violated a constraint. This value should not be empty.',
        logref: 400
      } as const satisfies z.infer<typeof ErrorResponseSchema>,
      400
    )
  }

  try {
    const client = await initAlgoliaClient()

    const [videoHits, languageHits, countryHits] = await Promise.all([
      searchVideoVariantsAlgolia(term, metadataLanguageTags, client),
      searchAlgoliaLanguages(term, metadataLanguageTags, client),
      searchAlgoliaCountries(term, metadataLanguageTags, client)
    ])

    const transformedVideos = videoHits.map((hit: AlgoliaVideoHit) => ({
      mediaComponentId: hit.mediaComponentId,
      componentType: hit.componentType,
      subType: hit.subType,
      contentType: hit.contentType,
      imageUrls: {
        thumbnail: hit.imageUrls.thumbnail,
        videoStill: hit.imageUrls.videoStill,
        mobileCinematicHigh: hit.imageUrls.mobileCinematicHigh,
        mobileCinematicLow: hit.imageUrls.mobileCinematicLow,
        mobileCinematicVeryLow: hit.imageUrls.mobileCinematicVeryLow
      },
      lengthInMilliseconds: hit.lengthInMilliseconds ?? 0,
      containsCount: hit.containsCount,
      isDownloadable: hit.isDownloadable,
      downloadSizes: {
        approximateSmallDownloadSizeInBytes:
          hit.downloadSizes?.approximateSmallDownloadSizeInBytes,
        approximateLargeDownloadSizeInBytes:
          hit.downloadSizes?.approximateLargeDownloadSizeInBytes
      },
      bibleCitations:
        hit.bibleCitations?.map((citation) => ({
          osisBibleBook: citation.osisBibleBook,
          chapterStart:
            citation.chapterStart === -1 ? null : citation.chapterStart,
          verseStart: citation.verseStart === -1 ? null : citation.verseStart,
          chapterEnd: citation.chapterEnd === -1 ? null : citation.chapterEnd,
          verseEnd: citation.verseEnd === -1 ? null : citation.verseEnd
        })) ?? [],
      primaryLanguageId: hit.primaryLanguageId,
      title:
        hit.titles.find((t) => t.bcp47 === metadataLanguageTags[0])?.value ??
        hit.titles.find((t) => t.bcp47 === 'en')?.value ??
        '',
      shortDescription:
        hit.descriptions.find((d) => d.bcp47 === metadataLanguageTags[0])
          ?.value ??
        hit.descriptions.find((d) => d.bcp47 === 'en')?.value ??
        '',
      longDescription:
        hit.descriptions.find((d) => d.bcp47 === metadataLanguageTags[0])
          ?.value ??
        hit.descriptions.find((d) => d.bcp47 === 'en')?.value ??
        '',
      studyQuestions: hit.studyQuestions
        .filter((q) => q.bcp47 === metadataLanguageTags[0] || q.bcp47 === 'en')
        .map((q) => q.value)
        .flat()
        .filter((q): q is string => q !== undefined && q !== ''),
      metadataLanguageTag: metadataLanguageTags[0] ?? 'en'
    }))

    const transformedLanguages = languageHits.map((hit) => ({
      languageId: Number(hit.objectID),
      iso3: hit.iso3,
      bcp47: hit.bcp47 ?? hit.iso3 ?? '',
      primaryCountryId: hit.primaryCountryId,
      name:
        hit.names.find((n) => n.bcp47 === metadataLanguageTags[0])?.value ??
        hit.names.find((n) => n.bcp47 === 'en')?.value ??
        '',
      nameNative: hit.nameNative ?? '',
      metadataLanguageTag: metadataLanguageTags[0] ?? 'en',
      _links: {
        self: {
          href: `http://api.arclight.org/v2/media-languages/${hit.objectID}?apiKey=${apiKey}`
        }
      }
    }))

    const transformedCountries = countryHits.map((hit) => ({
      countryId: hit.countryId,
      name:
        hit.names.find((n) => n.bcp47 === metadataLanguageTags[0])?.value ??
        hit.names.find((n) => n.bcp47 === 'en')?.value ??
        '',
      continentName: hit.continentName,
      metadataLanguageTag: metadataLanguageTags[0] ?? 'en',
      longitude: hit.longitude,
      latitude: hit.latitude,
      _links: {
        self: {
          href: `http://api.arclight.org/v2/media-countries/${hit.countryId}?apiKey=${apiKey}`
        }
      }
    }))

    const resourceCount =
      transformedVideos.length +
      countryHits.length +
      transformedLanguages.length

    const transformedResponse = {
      _links: {
        self: {
          href: `http://api.arclight.org/v2/resources?term=${term}&bulk=${bulk}&apiKey=${apiKey}`
        }
      },
      _embedded: {
        resources: {
          resourceCount,
          ...(bulk === 'true'
            ? {
                countryIds: countryHits.map((country) => country.countryId),
                languageIds: languageHits.map((language) =>
                  Number(language.objectID)
                ),
                alternateLanguageIds: [],
                mediaComponentIds: transformedVideos.map(
                  (video) => video.mediaComponentId
                )
              }
            : {
                mediaCountries: transformedCountries,
                mediaLanguages: transformedLanguages,
                alternateLanguages: [],
                mediaComponents: transformedVideos
              })
        }
      }
    }

    return c.json(transformedResponse, 200)
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error) {
      if (error.name === 'ApiError') {
        console.error('Algolia API Error:', error)
        return c.json(
          {
            message: `Algolia API Error: ${(error as { message?: string }).message ?? 'Unknown error'}`,
            logref: 403
          },
          403
        )
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred'

    console.error('Resources API Error:', error)

    return c.json(
      {
        message: `Internal server error: ${errorMessage}`,
        logref: 500
      } as const satisfies z.infer<typeof ErrorResponseSchema>,
      500
    )
  }
})
