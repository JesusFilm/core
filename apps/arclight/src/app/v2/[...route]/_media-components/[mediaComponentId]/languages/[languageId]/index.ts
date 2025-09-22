import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

import { prisma as languagesPrisma } from '@core/prisma/languages/client'
import { prisma as mediaPrisma } from '@core/prisma/media/client'

import {
  generateCacheKey,
  getWithStaleCache
} from '../../../../../../../lib/cache'
import { findDownloadWithFallback } from '../../../../../../../lib/downloadHelpers'
import { getDefaultPlatformForApiKey } from '../../../../../../../lib/getPlatformFromApiKey'
import {
  getWebEmbedPlayer,
  getWebEmbedSharePlayer
} from '../../../../../../../lib/stringsForArclight/webEmbedStrings'

export const mediaComponentLanguage = new OpenAPIHono()

const QuerySchema = z.object({
  apiKey: z.string().optional().describe('API key'),
  platform: z.string().optional().describe('Platform (ios, android, web)'),
  languageIds: z
    .string()
    .optional()
    .describe('Filter by language IDs (comma separated)')
})

const ParamsSchema = z.object({
  mediaComponentId: z.string(),
  languageId: z.string()
})

const SubtitleSchema = z.object({
  vtt: z.array(
    z.object({
      languageId: z.number(),
      languageName: z.string(),
      languageTag: z.string(),
      url: z.string()
    })
  ),
  srt: z.array(
    z.object({
      languageId: z.number(),
      languageName: z.string(),
      languageTag: z.string(),
      url: z.string()
    })
  )
})
type SubtitleSchema = z.infer<typeof SubtitleSchema>

const DownloadSchema = z.object({
  url: z.string(),
  height: z.number(),
  width: z.number(),
  sizeInBytes: z.number(),
  bitrate: z.number()
})
export type DownloadSchema = z.infer<typeof DownloadSchema>

const DownloadUrlSchema = z.object({
  low: DownloadSchema.optional(),
  high: DownloadSchema.optional()
})
type DownloadUrlSchema = z.infer<typeof DownloadUrlSchema>

const StreamSchema = z.object({
  url: z.string(),
  videoBitrate: z.number(),
  videoContainer: z.string().optional()
})
type StreamSchema = z.infer<typeof StreamSchema>

const StreamingUrlSchema = z.object({
  dash: z.array(StreamSchema).optional(),
  m3u8: z.array(StreamSchema).optional(),
  hls: z.array(StreamSchema).optional(),
  http: z.array(StreamSchema).optional()
})

type StreamingUrlSchema = z.infer<typeof StreamingUrlSchema>

const ResponseSchema = z.object({
  mediaComponentId: z.string(),
  languageId: z.string(),
  refId: z.string(),
  apiSessionId: z.string(),
  platform: z.string(),
  lengthInMilliseconds: z.number(),
  subtitleUrls: SubtitleSchema,
  downloadUrls: DownloadUrlSchema,
  streamingUrls: StreamingUrlSchema,
  shareUrl: z.string(),
  socialMediaUrls: z.record(z.string(), z.string()),
  _embedded: z.object({
    contains: z.array(
      z.object({
        mediaComponentId: z.string(),
        languageId: z.number(),
        refId: z.string(),
        apiSessionId: z.string(),
        lengthInMilliseconds: z.number()
      })
    )
  }),
  _links: z.object({
    self: z.object({
      href: z.string().url()
    }),
    mediaComponent: z.object({
      href: z.string().url()
    }),
    mediaLanguage: z.object({
      href: z.string().url()
    })
  })
})

const route = createRoute({
  method: 'get',
  path: '/',
  tags: ['Media Component Languages'],
  summary: 'Get media component language by media component id and language id',
  description:
    'Get media component language by media component id and language id',
  request: {
    query: QuerySchema,
    params: ParamsSchema
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ResponseSchema
        }
      },
      description: 'Media component language'
    },
    404: {
      description: 'Not found'
    }
  }
})

mediaComponentLanguage.openapi(route, async (c) => {
  const mediaComponentId = c.req.param('mediaComponentId')!
  const languageId = c.req.param('languageId')!
  const expand = c.req.query('expand') ?? ''
  const apiKey = c.req.query('apiKey') ?? ''

  let platform = c.req.query('platform')
  if (!platform && apiKey) {
    platform = await getDefaultPlatformForApiKey(apiKey)
  }
  if (!platform) {
    platform = 'ios' // Default platform for this route
  }

  const apiSessionId = c.req.query('apiSessionId') ?? '6622f10d2260a8.05128925'

  const cacheKey = generateCacheKey([
    'media-component-language',
    mediaComponentId ?? '',
    languageId ?? '',
    expand,
    platform,
    apiKey ?? ''
  ])

  const cachedData = await getWithStaleCache(cacheKey, async () => {
    const videoQuery = {
      where: { id: mediaComponentId },
      select: {
        variants: {
          where: { languageId: languageId },
          select: {
            id: true,
            languageId: true,
            lengthInMilliseconds: true,
            hls: true,
            dash: true,
            share: true,
            edition: true,
            downloads: {
              select: {
                quality: true,
                url: true,
                size: true,
                height: true,
                width: true,
                bitrate: true
              }
            }
          }
        },
        subtitles: {
          select: {
            languageId: true,
            vttSrc: true,
            srtSrc: true,
            edition: true
          }
        },
        ...(expand.includes('contains') && {
          children: {
            where: {
              variants: {
                some: { languageId: languageId }
              }
            },
            select: {
              id: true,
              label: true,
              primaryLanguageId: true,
              variants: {
                where: { languageId: languageId },
                select: {
                  id: true,
                  lengthInMilliseconds: true,
                  hls: true,
                  share: true,
                  downloads: {
                    select: {
                      quality: true,
                      url: true,
                      size: true,
                      height: true,
                      width: true,
                      bitrate: true
                    }
                  }
                }
              },
              subtitles: {
                select: {
                  languageId: true,
                  vttSrc: true,
                  srtSrc: true,
                  edition: true
                }
              }
            }
          }
        })
      }
    }

    let video
    try {
      video = await mediaPrisma.video.findUnique(videoQuery)
    } catch (error) {
      console.error(
        `Database error fetching video ${mediaComponentId} with language ${languageId}:`,
        error
      )
      throw error
    }

    if (!video || !video.variants || video.variants.length === 0) {
      console.error(`Video ${mediaComponentId} not found!`)
      return {
        data: {
          message: `Media component '${mediaComponentId}' language '${languageId}' not found!`,
          logref: 404
        },
        statusCode: 404
      }
    }

    const subtitleLanguageIds = video.subtitles?.map((s) => s.languageId)

    const languageQuery = {
      where: {
        id: { in: subtitleLanguageIds }
      },
      select: {
        id: true,
        bcp47: true,
        iso3: true,
        name: {
          where: {
            languageId: { equals: '529' }
          },
          select: {
            value: true
          }
        }
      }
    }

    let languages
    if (subtitleLanguageIds?.length > 0) {
      try {
        languages = await languagesPrisma.language.findMany(languageQuery)
      } catch (error) {
        console.error(`Database error fetching languages:`, error)
        throw error
      }
    }

    const languageMap = languages
      ? new Map(languages.map((lang) => [lang.id, lang]))
      : new Map()

    const variant = video.variants[0]
    type Variant = typeof variant
    const downloads = variant.downloads
    type Download = (typeof downloads)[0]
    const subtitles = video.subtitles
    type Subtitle = (typeof subtitles)[0]

    type NormalizedDownload = {
      quality: string
      url: string
      size: number
      height: number
      width: number
      bitrate: number
    }
    const normalizeDownloads = (
      downloads: Download[]
    ): NormalizedDownload[] => {
      return downloads.map((d) => ({
        quality: d.quality ?? '',
        url: d.url,
        size: d.size ?? 0,
        height: d.height ?? 0,
        width: d.width ?? 0,
        bitrate: d.bitrate ?? 0
      }))
    }

    const buildDownloadUrls = (
      normalizedDownloads: NormalizedDownload[],
      apiKey?: string
    ): DownloadUrlSchema => {
      if (!normalizedDownloads || normalizedDownloads.length === 0)
        return { low: undefined, high: undefined }

      const downloadLow = findDownloadWithFallback(
        normalizedDownloads,
        'low',
        apiKey
      )

      const downloadHigh = findDownloadWithFallback(
        normalizedDownloads,
        'high',
        apiKey
      )

      return {
        low: downloadLow
          ? {
              url: downloadLow.url,
              height: downloadLow.height || 240,
              width: downloadLow.width || 426,
              sizeInBytes: downloadLow.size,
              bitrate: downloadLow.bitrate
            }
          : undefined,
        high: downloadHigh
          ? {
              url: downloadHigh.url,
              height: downloadHigh.height || 720,
              width: downloadHigh.width || 1280,
              sizeInBytes: downloadHigh.size,
              bitrate: downloadHigh.bitrate
            }
          : undefined
      }
    }

    let webEmbedPlayer = ''
    let webEmbedSharePlayer = ''
    if (platform === 'web') {
      webEmbedPlayer = getWebEmbedPlayer(variant.id, apiSessionId)
      webEmbedSharePlayer = getWebEmbedSharePlayer(variant.id, apiSessionId)
    }

    const buildSubtitleUrls = (subtitles: Subtitle[]): SubtitleSchema => {
      const subtitleUrls: SubtitleSchema = {
        vtt: [],
        srt: []
      }
      if (subtitles?.length === 0) return subtitleUrls

      const editionSubtitles = subtitles.filter(
        (subtitle: Subtitle) =>
          subtitle.edition === variant.edition ||
          (!subtitle.edition && !variant.edition)
      )

      for (const subtitle of editionSubtitles) {
        const languageInfo = languageMap.get(subtitle.languageId)
        if (!languageInfo || !languageInfo.name[0])
          continue
        subtitleUrls.vtt.push({
          languageId: Number(subtitle.languageId),
          languageName: languageInfo.name[0].value,
          languageTag: languageInfo.bcp47 ?? languageInfo.iso3 ?? 'en',
          url: subtitle.vttSrc ?? ''
        })
        subtitleUrls.srt.push({
          languageId: Number(subtitle.languageId),
          languageName: languageInfo.name[0].value,
          languageTag: languageInfo.bcp47 ?? languageInfo.iso3 ?? 'en',
          url: subtitle.srtSrc ?? ''
        })
      }
      return subtitleUrls
    }

    const buildStreamingUrls = (
      platform: string,
      variant: Variant,
      normalizedDownloads: NormalizedDownload[]
    ): StreamingUrlSchema => {
      if (!variant.hls && !variant.dash) return {}

      const downloadLow = findDownloadWithFallback(
        normalizedDownloads,
        'low',
        apiKey
      )

      const downloadSd = findDownloadWithFallback(
        normalizedDownloads,
        'sd',
        apiKey
      )

      const downloadHigh = findDownloadWithFallback(
        normalizedDownloads,
        'high',
        apiKey
      )

      switch (platform) {
        case 'android':
          return {
            dash: variant.dash ? [{ videoBitrate: 0, url: variant.dash }] : [],
            hls: variant.hls ? [{ videoBitrate: 0, url: variant.hls }] : [],
            http: [
              {
                videoBitrate: downloadLow?.bitrate ?? 0,
                videoContainer: 'MP4',
                url: downloadLow?.url ?? ''
              },
              {
                videoBitrate: downloadSd?.bitrate ?? 0,
                videoContainer: 'MP4',
                url: downloadSd?.url ?? ''
              },
              {
                videoBitrate: downloadSd?.bitrate ?? 0,
                videoContainer: 'MP4',
                url: downloadSd?.url ?? ''
              },
              {
                videoBitrate: downloadSd?.bitrate ?? 0,
                videoContainer: 'MP4',
                url: downloadSd?.url ?? ''
              },
              {
                videoBitrate: downloadSd?.bitrate ?? 0,
                videoContainer: 'MP4',
                url: downloadSd?.url ?? ''
              },
              {
                videoBitrate: downloadHigh?.bitrate ?? 0,
                videoContainer: 'MP4',
                url: downloadHigh?.url ?? ''
              }
            ]
          }
        case 'ios':
          return {
            m3u8: variant.hls
              ? [
                  {
                    videoBitrate: 0,
                    videoContainer: 'M2TS',
                    url: variant.hls
                  }
                ]
              : [],
            http: []
          }
        default: // 'web'
          return {}
      }
    }

    const normalizedDownloads = normalizeDownloads(downloads)

    return {
      data: {
        mediaComponentId,
        languageId: Number(languageId),
        refId: variant.id,
        apiSessionId,
        platform,
        lengthInMilliseconds: variant.lengthInMilliseconds ?? 0,
        subtitleUrls: buildSubtitleUrls(subtitles),
        downloadUrls: buildDownloadUrls(normalizedDownloads, apiKey),
        streamingUrls: buildStreamingUrls(
          platform,
          variant,
          normalizedDownloads
        ),
        shareUrl:
          variant.share ??
          `https://arc.gt/s/${variant.id}/${variant.languageId}`,
        socialMediaUrls: {},
        ...(platform === 'web' && {
          webEmbedPlayer,
          webEmbedSharePlayer
        }),
        openGraphVideoPlayer: 'https://jesusfilm.org/',
        _links: {
          self: {
            href: c.req.url
          },
          mediaComponent: {
            href: `http://api.arclight.org/v2/media-components/${mediaComponentId}?apiKey=${apiKey ?? ''}`
          },
          mediaLanguage: {
            href: `http://api.arclight.org/v2/media-languages/${languageId}?apiKey=${apiKey ?? ''}`
          }
        },
        ...(expand.includes('contains') &&
          video.children &&
          video.children.length > 0 && {
            _embedded: {
              contains: video.children.map((child: any) => {
                const childVariant = child.variants?.[0]
                const childNormalizedDownloads = normalizeDownloads(
                  childVariant.downloads
                )
                return {
                  mediaComponentId: child.id,
                  languageId: Number(languageId),
                  refId: `${child.id}_${languageId}-${child.label}`,
                  apiSessionId,
                  lengthInMilliseconds: childVariant?.lengthInMilliseconds ?? 0,
                  subtitleUrls: buildSubtitleUrls(child.subtitles),
                  downloadUrls: buildDownloadUrls(
                    childNormalizedDownloads,
                    apiKey
                  ),
                  streamingUrls: buildStreamingUrls(
                    platform,
                    childVariant,
                    childNormalizedDownloads
                  ),
                  shareUrl:
                    childVariant?.share ??
                    `https://arc.gt/s/${childVariant?.id}/${languageId}`,
                  socialMediaUrls: {},
                  _links: {
                    self: {
                      href: `http://api.arclight.org/v2/media-components/${child.id}/languages/${languageId}?apiKey=${apiKey ?? ''}`
                    },
                    mediaComponent: {
                      href: `http://api.arclight.org/v2/media-components/${child.id}?apiKey=${apiKey ?? ''}`
                    },
                    mediaLanguage: {
                      href: `http://api.arclight.org/v2/media-languages/${languageId}?apiKey=${apiKey ?? ''}`
                    }
                  }
                }
              })
            }
          })
      },
      statusCode: 200
    }
  })
  return c.json(cachedData.data, cachedData.statusCode as 200 | 404 | 500)
})
