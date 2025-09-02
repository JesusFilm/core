import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { timeout } from 'hono/timeout'

import { ResultOf, graphql } from '@core/shared/gql'

import { getApolloClient } from '../../../../lib/apolloClient'
import { generateCacheKey, getWithStaleCache } from '../../../../lib/cache'
import { getDownloadSize } from '../../../../lib/downloadHelpers'
import { getLanguageIdsFromTags } from '../../../../lib/getLanguageIdsFromTags'

import { mediaComponent } from './[mediaComponentId]'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const GET_VIDEOS_WITH_FALLBACK = graphql(`
  query GetVideosWithFallback(
    $limit: Int
    $offset: Int
    $ids: [ID!]
    $languageIds: [ID!]
    $metadataLanguageId: ID
    $fallbackLanguageId: ID
    $labels: [VideoLabel!]
  ) {
    videosCount(
      where: {
        ids: $ids
        availableVariantLanguageIds: $languageIds
        labels: $labels
      }
    )
    videos(
      limit: $limit
      offset: $offset
      where: {
        ids: $ids
        availableVariantLanguageIds: $languageIds
        labels: $labels
      }
    ) {
      id
      label
      images {
        thumbnail
        videoStill
        mobileCinematicHigh
        mobileCinematicLow
        mobileCinematicVeryLow
      }
      primaryLanguageId
      title(languageId: $metadataLanguageId) {
        value
        language {
          bcp47
        }
      }
      fallbackTitle: title(languageId: $fallbackLanguageId) {
        value
      }
      description(languageId: $metadataLanguageId) {
        value
        language {
          bcp47
        }
      }
      fallbackDescription: description(languageId: $fallbackLanguageId) {
        value
      }
      snippet(languageId: $metadataLanguageId) {
        value
        language {
          bcp47
        }
      }
      fallbackSnippet: snippet(languageId: $fallbackLanguageId) {
        value
      }
      studyQuestions(languageId: $metadataLanguageId) {
        value
        language {
          bcp47
        }
      }
      fallbackStudyQuestions: studyQuestions(languageId: $fallbackLanguageId) {
        value
      }
      bibleCitations {
        osisId
        chapterStart
        verseStart
        chapterEnd
        verseEnd
      }
      childrenCount
      availableLanguages
      variant {
        hls
        lengthInMilliseconds
        language {
          bcp47
        }
        downloadable
        downloads {
          height
          width
          quality
          size
        }
      }
    }
  }
`)

const QuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  subTypes: z.string().optional(),
  languageIds: z.string().optional(),
  ids: z.string().optional(),
  apiKey: z.string().optional()
})

export const MediaComponentSchema = z.object({
  mediaComponentId: z.string(),
  componentType: z.string(),
  subType: z.string(),
  contentType: z.string(),
  imageUrls: z.object({
    thumbnail: z.string(),
    videoStill: z.string(),
    mobileCinematicHigh: z.string(),
    mobileCinematicLow: z.string(),
    mobileCinematicVeryLow: z.string()
  }),
  lengthInMilliseconds: z.number(),
  containsCount: z.number(),
  isDownloadable: z.boolean(),
  downloadSizes: z.object({
    approximateSmallDownloadSizeInBytes: z.number(),
    approximateLargeDownloadSizeInBytes: z.number()
  }),
  bibleCitations: z.array(
    z.object({
      osisBibleBook: z.string(),
      chapterStart: z.number().nullable(),
      verseStart: z.number().nullable(),
      chapterEnd: z.number().nullable(),
      verseEnd: z.number().nullable()
    })
  ),
  primaryLanguageId: z.number(),
  title: z.string(),
  shortDescription: z.string(),
  longDescription: z.string(),
  studyQuestions: z.array(z.string()),
  metadataLanguageTag: z.string()
})

const ResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  pages: z.number(),
  total: z.number(),
  apiSessionId: z.string(),
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
    mediaComponents: z.array(MediaComponentSchema)
  })
})

const route = createRoute({
  method: 'get',
  path: '/',
  tags: ['Media Components'],
  summary: 'Get media components',
  description: 'Get media components',
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
      description: 'Media components'
    }
  },
  middleware: [timeout(60000)]
})

export const mediaComponents = new OpenAPIHono()
mediaComponents.route('/:mediaComponentId', mediaComponent)

mediaComponents.openapi(route, async (c) => {
  const page = c.req.query('page') == null ? 1 : Number(c.req.query('page'))
  const limit =
    c.req.query('limit') == null ? 10000 : Number(c.req.query('limit'))
  const offset = (page - 1) * limit
  const expand = c.req.query('expand') ?? ''
  const subTypes =
    c.req.query('subTypes')?.split(',').filter(Boolean).length === 0
      ? undefined
      : c.req.query('subTypes')?.split(',').filter(Boolean)
  const languageIds =
    c.req.query('languageIds')?.split(',').filter(Boolean).length === 0
      ? undefined
      : c.req.query('languageIds')?.split(',').filter(Boolean)
  const ids =
    c.req.query('ids')?.split(',').filter(Boolean).length === 0
      ? undefined
      : c.req.query('ids')?.split(',').filter(Boolean)
  const metadataLanguageTags =
    c.req.query('metadataLanguageTags')?.split(',').filter(Boolean) ?? []
  const apiSessionId = c.req.query('apiSessionId') ?? '6622f10d2260a8.05128925'
  const apiKey = c.req.query('apiKey')

  const languageResult = await getLanguageIdsFromTags(metadataLanguageTags)
  if (languageResult instanceof HTTPException) {
    throw languageResult
  }

  const { metadataLanguageId, fallbackLanguageId } = languageResult

  const cacheKey = generateCacheKey([
    'media-components',
    page.toString(),
    limit.toString(),
    expand,
    ...(subTypes ?? []).slice(0, 20),
    ...(languageIds ?? []).slice(0, 20),
    ...(ids ?? []).slice(0, 20),
    ...metadataLanguageTags.slice(0, 20)
  ])

  const response = await getWithStaleCache(cacheKey, async () => {
    let data
    try {
      const result = await getApolloClient().query<
        ResultOf<typeof GET_VIDEOS_WITH_FALLBACK>
      >({
        query: GET_VIDEOS_WITH_FALLBACK,
        variables: {
          metadataLanguageId,
          fallbackLanguageId,
          languageIds,
          limit,
          offset,
          labels: subTypes,
          ...(ids != null ? { ids } : {})
        }
      })
      data = result.data
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return {
          data: {
            page,
            limit,
            pages: 1,
            total: 0,
            apiSessionId: apiSessionId,
            _links: {
              self: {
                href: `http://api.arclight.org/v2/media-components?${new URLSearchParams(c.req.query()).toString()}`
              },
              first: {
                href: `http://api.arclight.org/v2/media-components?${new URLSearchParams({ ...c.req.query(), page: '1' }).toString()}`
              },
              last: {
                href: `http://api.arclight.org/v2/media-components?${new URLSearchParams({ ...c.req.query(), page: '1' }).toString()}`
              }
            },
            _embedded: { mediaComponents: [] }
          },
          statusCode: 200
        }
      }
      throw error
    }

    const videos = data.videos
    const total = data.videosCount

    const queryObject = {
      ...c.req.query(),
      page: page.toString(),
      limit: limit.toString()
    }

    const filteredVideos = videos.filter(
      (video) =>
        video.title[0]?.value != null ||
        video.fallbackTitle[0]?.value != null ||
        video.snippet[0]?.value != null ||
        video.description[0]?.value != null
    )
    const lastPage =
      Math.ceil(total / limit) === 0 ? 1 : Math.ceil(total / limit)

    const mediaComponents = filteredVideos.map((video) => {
      const isDownloadable =
        video.label === 'collection' || video.label === 'series'
          ? false
          : (video.variant?.downloadable ?? false)
      return {
        mediaComponentId: video.id,
        componentType: video.variant?.hls != null ? 'content' : 'container',
        subType: video.label,
        contentType: video.variant?.hls != null ? 'video' : 'none',
        imageUrls: {
          thumbnail:
            video.images.find((image) => image.thumbnail != null)?.thumbnail ??
            '',
          videoStill:
            video.images.find((image) => image.videoStill != null)
              ?.videoStill ?? '',
          mobileCinematicHigh:
            video.images.find((image) => image.mobileCinematicHigh != null)
              ?.mobileCinematicHigh ?? '',
          mobileCinematicLow:
            video.images.find((image) => image.mobileCinematicLow != null)
              ?.mobileCinematicLow ?? '',
          mobileCinematicVeryLow:
            video.images.find((image) => image.mobileCinematicVeryLow != null)
              ?.mobileCinematicVeryLow ?? ''
        },
        lengthInMilliseconds: video.variant?.lengthInMilliseconds ?? 0,
        containsCount: video.childrenCount,
        isDownloadable,
        downloadSizes: {
          approximateSmallDownloadSizeInBytes: isDownloadable
            ? getDownloadSize(video.variant?.downloads, 'low')
            : 0,
          approximateLargeDownloadSizeInBytes: isDownloadable
            ? getDownloadSize(video.variant?.downloads, 'high')
            : 0
        },
        bibleCitations: video.bibleCitations.map((citation) => ({
          osisBibleBook: citation.osisId,
          chapterStart:
            citation.chapterStart === -1 ? null : citation.chapterStart,
          verseStart: citation.verseStart === -1 ? null : citation.verseStart,
          chapterEnd: citation.chapterEnd === -1 ? null : citation.chapterEnd,
          verseEnd: citation.verseEnd === -1 ? null : citation.verseEnd
        })),
        primaryLanguageId: Number(video.primaryLanguageId),
        title: video.title[0]?.value ?? video.fallbackTitle[0]?.value ?? '',
        shortDescription:
          video.snippet[0]?.value ?? video.fallbackSnippet[0]?.value ?? '',
        longDescription:
          video.description[0]?.value ??
          video.fallbackDescription[0]?.value ??
          '',
        studyQuestions:
          video.studyQuestions.length > 0
            ? video.studyQuestions.map((question) => question.value)
            : video.fallbackStudyQuestions.map((question) => question.value),
        metadataLanguageTag: video.title[0]?.language.bcp47 ?? 'en',
        ...(expand.includes('languageIds')
          ? {
              languageIds: video.availableLanguages.map((languageId) =>
                typeof languageId === 'string' ? Number(languageId) : languageId
              )
            }
          : {})
      }
    })

    const queryString = new URLSearchParams(queryObject).toString()
    const firstQueryString = new URLSearchParams({
      ...queryObject,
      page: '1'
    }).toString()
    const lastQueryString = new URLSearchParams({
      ...queryObject,
      page: lastPage.toString()
    }).toString()
    const nextQueryString = new URLSearchParams({
      ...queryObject,
      page: (page + 1).toString()
    }).toString()
    const previousQueryString = new URLSearchParams({
      ...queryObject,
      page: (page - 1).toString()
    }).toString()

    return {
      data: {
        page,
        limit,
        pages: lastPage,
        total,
        apiSessionId: apiSessionId,
        _links: {
          self: {
            href: `http://api.arclight.org/v2/media-components?${queryString}`
          },
          first: {
            href: `http://api.arclight.org/v2/media-components?${firstQueryString}`
          },
          last: {
            href: `http://api.arclight.org/v2/media-components?${lastQueryString}`
          },
          ...(page < lastPage && {
            next: {
              href: `http://api.arclight.org/v2/media-components?${nextQueryString}`
            }
          }),
          ...(page > 1 && {
            previous: {
              href: `http://api.arclight.org/v2/media-components?${previousQueryString}`
            }
          })
        },
        _embedded: {
          mediaComponents
        }
      },
      statusCode: 200
    }
  })

  return c.json(response.data)
})
