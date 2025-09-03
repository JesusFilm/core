import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { timeout } from 'hono/timeout'

import { VideoLabel, prisma as mediaPrisma } from '@core/prisma/media/client'

import { generateCacheKey, getWithStaleCache } from '../../../../lib/cache'
import { getLanguageDetailsFromTags } from '../../../../lib/getLanguageIdsFromTags'
import { getImageUrl } from '../../../../lib/imageHelper'

import { mediaComponent } from './[mediaComponentId]'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    const { metadataLanguageIds, metadataLanguageDetails } =
      await getLanguageDetailsFromTags(metadataLanguageTags)

    let videos
    let totalCount = 0
    try {
      // Use a single Prisma transaction to reduce connection overhead
      const result = await mediaPrisma.$transaction(async (tx) => {
        const videosResult = await tx.video.findMany({
          select: {
            id: true,
            label: true,
            primaryLanguageId: true,
            images: true,
            title: {
              select: {
                value: true,
                languageId: true
              },
              where: {
                languageId: { in: metadataLanguageIds }
              }
            },
            description: {
              select: {
                value: true,
                languageId: true
              },
              where: {
                languageId: { in: metadataLanguageIds }
              }
            },
            snippet: {
              select: {
                value: true,
                languageId: true
              },
              where: {
                languageId: { in: metadataLanguageIds }
              }
            },
            studyQuestions: {
              select: {
                value: true,
                languageId: true
              },
              where: {
                languageId: { in: metadataLanguageIds }
              }
            },
            bibleCitation: {
              select: {
                osisId: true,
                chapterStart: true,
                verseStart: true,
                chapterEnd: true,
                verseEnd: true
              }
            },
            children: true,
            availableLanguages: true,
            variants: {
              select: {
                hls: true,
                lengthInMilliseconds: true,
                languageId: true,
                downloadable: true,
                downloads: {
                  select: {
                    quality: true,
                    size: true
                  }
                }
              },
              take: 1
            }
          },
          skip: offset,
          take: limit,
          where: {
            ...(ids ? { id: { in: ids } } : {}),
            ...(languageIds
              ? { availableLanguages: { hasSome: languageIds } }
              : {}),
            ...(subTypes ? { label: { in: subTypes as VideoLabel[] } } : {}),
            ...(metadataLanguageTags.length > 0
              ? {
                  subtitles: {
                    some: { languageId: { in: metadataLanguageIds } }
                  }
                }
              : {})
          }
        })

        const totalCountResult = await tx.video.count({
          where: {
            ...(ids ? { id: { in: ids } } : {}),
            ...(languageIds
              ? { availableLanguages: { hasSome: languageIds } }
              : {}),
            ...(subTypes ? { label: { in: subTypes as VideoLabel[] } } : {}),
            ...(metadataLanguageTags.length > 0
              ? {
                  subtitles: {
                    some: { languageId: { in: metadataLanguageIds } }
                  }
                }
              : {})
          }
        })

        return { videos: videosResult, totalCount: totalCountResult }
      })

      videos = result.videos
      totalCount = result.totalCount
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

    const total = videos.length

    const queryObject = {
      ...c.req.query(),
      page: page.toString(),
      limit: limit.toString()
    }

    const lastPage =
      Math.ceil(total / limit) === 0 ? 1 : Math.ceil(total / limit)

    const mediaComponents = videos.map((video) => {
      const hdImage = video.images.find((img) => img.aspectRatio === 'hd')
      const bannerImage = video.images.find(
        (img) => img.aspectRatio === 'banner'
      )

      const variant = video.variants[0]
      const isDownloadable =
        video.label === 'collection' || video.label === 'series'
          ? false
          : (variant?.downloadable ?? false)
      return {
        mediaComponentId: video.id,
        componentType: variant?.hls != null ? 'content' : 'container',
        subType: video.label,
        contentType: variant?.hls != null ? 'video' : 'none',
        imageUrls: {
          thumbnail: getImageUrl(hdImage?.id, 'thumbnail'),
          videoStill: getImageUrl(hdImage?.id, 'videoStill'),
          mobileCinematicHigh: getImageUrl(
            bannerImage?.id,
            'mobileCinematicHigh'
          ),
          mobileCinematicLow: getImageUrl(
            bannerImage?.id,
            'mobileCinematicLow'
          ),
          mobileCinematicVeryLow: getImageUrl(
            bannerImage?.id,
            'mobileCinematicVeryLow'
          )
        },
        lengthInMilliseconds: variant?.lengthInMilliseconds ?? 0,
        containsCount: video.children.length,
        isDownloadable,
        downloadSizes: {
          approximateSmallDownloadSizeInBytes: isDownloadable
            ? (variant?.downloads.find((d) => d.quality === 'low')?.size ?? 0)
            : 0,
          approximateLargeDownloadSizeInBytes: isDownloadable
            ? (variant?.downloads.find((d) => d.quality === 'high')?.size ?? 0)
            : 0
        },
        bibleCitations: video.bibleCitation.map((citation) => ({
          osisBibleBook: citation.osisId,
          chapterStart:
            citation.chapterStart === -1 ? null : citation.chapterStart,
          verseStart: citation.verseStart === -1 ? null : citation.verseStart,
          chapterEnd: citation.chapterEnd === -1 ? null : citation.chapterEnd,
          verseEnd: citation.verseEnd === -1 ? null : citation.verseEnd
        })),
        primaryLanguageId: Number(video.primaryLanguageId),
        title: video.title[0]?.value ?? '',
        shortDescription: video.snippet[0]?.value ?? '',
        longDescription: video.description[0]?.value ?? '',
        studyQuestions:
          video.studyQuestions.length > 0
            ? video.studyQuestions.map((question) => question.value)
            : [],
        metadataLanguageTag:
          metadataLanguageDetails.find(
            (detail) => detail.languageId === video.title[0]?.languageId
          )?.languageTag ?? 'en',
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
        total: totalCount,
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
