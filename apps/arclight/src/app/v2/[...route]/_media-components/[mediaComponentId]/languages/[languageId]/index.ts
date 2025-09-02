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
  languageId: z.number(),
  languageName: z.string(),
  languageTag: z.string(),
  url: z.string()
})

const DownloadUrlSchema = z.object({
  url: z.string(),
  height: z.number(),
  width: z.number(),
  sizeInBytes: z.number()
})

const ResponseSchema = z.object({
  mediaComponentId: z.string(),
  languageId: z.string(),
  refId: z.string(),
  apiSessionId: z.string(),
  platform: z.string(),
  lengthInMilliseconds: z.number(),
  subtitleUrls: z.object({
    vtt: z.array(SubtitleSchema),
    srt: z.array(SubtitleSchema)
  }),
  downloadUrls: z.object({
    low: DownloadUrlSchema,
    high: DownloadUrlSchema
  }),
  streamingUrls: z.record(z.string(), z.string()),
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
          where: { languageId: languageId },
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
                where: { languageId: languageId },
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

    const variant = video.variants[0]
    type Variant = typeof variant
    const downloads = variant.downloads
    type Download = (typeof downloads)[0]
    const subtitles = video.subtitles
    type Subtitle = (typeof subtitles)[0]

    type DownloadUrls = {
      low?: {
        url: string | undefined
        height: number
        width: number
        sizeInBytes: number | undefined
        bitrate?: number | undefined
      }
      sd?: {
        url: string | undefined
        height: number
        width: number
        sizeInBytes: number | undefined
        bitrate?: number | undefined
      }
      high?: {
        url: string | undefined
        height: number
        width: number
        sizeInBytes: number | undefined
        bitrate?: number | undefined
      }
    }

    const buildDownloadUrls = (
      downloads: Download[],
      apiKey?: string
    ): DownloadUrls => {
      if (!downloads || downloads.length === 0)
        return { low: undefined, high: undefined, sd: undefined }

      const normalizedDownloads = downloads.map((d) => ({
        quality: d.quality,
        url: d.url,
        size: d.size ?? 0,
        height: d.height ?? 0,
        width: d.width ?? 0,
        bitrate: d.bitrate ?? 0
      }))

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
        sd: downloadSd
          ? {
              url: downloadSd.url,
              height: downloadSd.height || 360,
              width: downloadSd.width || 640,
              sizeInBytes: downloadSd.size,
              bitrate: downloadSd.bitrate
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

    const downloadUrls = buildDownloadUrls(downloads, apiKey)

    let webEmbedPlayer = ''
    let webEmbedSharePlayer = ''
    if (platform === 'web') {
      webEmbedPlayer = getWebEmbedPlayer(variant.id, apiSessionId)
      webEmbedSharePlayer = getWebEmbedSharePlayer(variant.id, apiSessionId)
    }

    let languages: Array<{
      id: string
      bcp47: string | null
      name: Array<{ value: string }>
    }> = []
    if (video.subtitles?.length > 0) {
      try {
        languages = await languagesPrisma.language.findMany({
          where: {
            id: { in: [languageId] }
          },
          select: {
            id: true,
            bcp47: true,
            name: {
              where: {
                languageId: { equals: '529' }
              },
              select: {
                value: true
              }
            }
          }
        })
      } catch (error) {
        console.error(`Database error fetching languages:`, error)
        throw error
      }
    }

    const languageMap = new Map(languages.map((lang) => [lang.id, lang]))

    const createSubtitleWithLanguageInfo = (
      subtitle: Subtitle,
      urlField: 'vttSrc' | 'srtSrc'
    ) => {
      const language = languageMap.get(subtitle.languageId)
      return {
        languageId: Number(subtitle.languageId),
        languageName: language?.name[0]?.value ?? '',
        languageTag: language?.bcp47 ?? '',
        url: subtitle[urlField],
        edition: subtitle.edition
      }
    }

    const subtitleConfig = {
      android: { vtt: 'vttSrc', srt: 'srtSrc' },
      ios: { vtt: 'vttSrc' },
      web: { vtt: 'vttSrc' }
    } as const

    let subtitleUrls = {}
    if (video.subtitles?.length > 0) {
      const config = subtitleConfig[platform as keyof typeof subtitleConfig]
      subtitleUrls = Object.entries(config).reduce(
        (acc, [format, urlField]) => {
          acc[format] =
            video.subtitles
              ?.filter(
                (subtitle: Subtitle) =>
                  subtitle.edition === variant.edition ||
                  (!subtitle.edition && !variant.edition)
              )
              ?.map((subtitle: Subtitle) =>
                createSubtitleWithLanguageInfo(subtitle, urlField)
              )
              ?.filter((s) => Boolean(s.url)) ?? []
          return acc
        },
        {} as Record<string, any[]>
      )
    }

    const getStreamingUrls = (
      platform: string,
      variant: Variant,
      dlUrls: DownloadUrls
    ) => {
      if (!variant.hls && !variant.dash) return {}

      switch (platform) {
        case 'android':
          return {
            dash: variant.dash ? [{ videoBitrate: 0, url: variant.dash }] : [],
            hls: variant.hls ? [{ videoBitrate: 0, url: variant.hls }] : [],
            http: [
              {
                videoBitrate: dlUrls.low?.bitrate ?? 0,
                videoContainer: 'MP4',
                url: dlUrls.low?.url
              },
              {
                videoBitrate: dlUrls.sd?.bitrate ?? 0,
                videoContainer: 'MP4',
                url: dlUrls.sd?.url
              },
              {
                videoBitrate: dlUrls.sd?.bitrate ?? 0,
                videoContainer: 'MP4',
                url: dlUrls.sd?.url
              },
              {
                videoBitrate: dlUrls.sd?.bitrate ?? 0,
                videoContainer: 'MP4',
                url: dlUrls.sd?.url
              },
              {
                videoBitrate: dlUrls.sd?.bitrate ?? 0,
                videoContainer: 'MP4',
                url: dlUrls.sd?.url
              },
              {
                videoBitrate: dlUrls.high?.bitrate ?? 0,
                videoContainer: 'MP4',
                url: dlUrls.high?.url
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

    const streamingUrls = getStreamingUrls(platform, variant, downloadUrls)

    return {
      data: {
        mediaComponentId,
        languageId: Number(languageId),
        refId: variant.id,
        apiSessionId,
        platform,
        lengthInMilliseconds: variant.lengthInMilliseconds ?? 0,
        subtitleUrls,
        downloadUrls,
        streamingUrls,
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
                const childVariant = child.variants?.[0] // Should only be one for the specific languageId
                const childDownloadUrls = childVariant
                  ? buildDownloadUrls(childVariant.downloads, apiKey)
                  : { low: undefined, high: undefined }

                return {
                  mediaComponentId: child.id,
                  languageId: Number(languageId),
                  refId: `${child.id}_${languageId}-${child.label}`,
                  apiSessionId,
                  lengthInMilliseconds: childVariant?.lengthInMilliseconds ?? 0,
                  subtitleUrls: {
                    vtt: child.subtitles?.map((subtitle: any) =>
                      createSubtitleWithLanguageInfo(subtitle, 'vttSrc')
                    ),
                    srt: child.subtitles?.map((subtitle: any) =>
                      createSubtitleWithLanguageInfo(subtitle, 'srtSrc')
                    )
                  },
                  downloadUrls: childDownloadUrls,
                  streamingUrls: getStreamingUrls(
                    platform,
                    childVariant,
                    childDownloadUrls
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
