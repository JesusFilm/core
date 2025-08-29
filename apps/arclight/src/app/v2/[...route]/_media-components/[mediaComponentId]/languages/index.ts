import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { timeout } from 'hono/timeout'

import { prisma as languagesPrisma } from '@core/prisma/languages/client'
import { prisma as mediaPrisma } from '@core/prisma/media/client'

import {
  generateCacheKey,
  getWithStaleCache
} from '../../../../../../lib/cache'
import { findDownloadWithFallback } from '../../../../../../lib/downloadHelpers'
import { getDefaultPlatformForApiKey } from '../../../../../../lib/getPlatformFromApiKey'
import {
  getWebEmbedPlayer,
  getWebEmbedSharePlayer
} from '../../../../../../lib/stringsForArclight/webEmbedStrings'

import { mediaComponentLanguage } from './[languageId]'

export const mediaComponentLanguages = new OpenAPIHono()
mediaComponentLanguages.route('/:languageId', mediaComponentLanguage)

const QuerySchema = z.object({
  apiKey: z.string().optional().describe('API key'),
  platform: z.string().optional().describe('Platform (ios, android, web)'),
  languageIds: z
    .string()
    .optional()
    .describe('Filter by language IDs (comma separated)')
})

const ParamsSchema = z.object({
  mediaComponentId: z.string()
})

const ResponseSchema = z.object({
  _links: z.object({
    self: z.object({
      href: z.string().url()
    }),
    mediaComponent: z.object({
      href: z.string().url()
    })
  }),
  _embedded: z.object({})
})

const route = createRoute({
  method: 'get',
  path: '/',
  tags: ['Media Component Languages'],
  summary: 'Get media component languages',
  description: 'Get media component languages',
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
      description: 'Media component languages'
    },
    404: {
      description: 'Not found'
    }
  },
  middleware: [timeout(60000)]
})

mediaComponentLanguages.openapi(route, async (c) => {
  const mediaComponentId = c.req.param('mediaComponentId')

  const apiKey = c.req.query('apiKey') ?? ''

  let platform = c.req.query('platform')
  if (!platform && apiKey) {
    platform = await getDefaultPlatformForApiKey(apiKey)
  }
  if (!platform) {
    platform = 'ios'
  }

  const languageIds = c.req.query('languageIds')?.split(',') ?? []
  const apiSessionId = c.req.query('apiSessionId') ?? '6622f10d2260a8.05128925'

  const cacheKey = generateCacheKey([
    'media-component-languages',
    mediaComponentId ?? '',
    platform,
    apiKey,
    apiSessionId,
    ...languageIds.slice(0, 20)
  ])

  const { data: cachedData, statusCode } = await getWithStaleCache(
    cacheKey,
    async () => {
      let video
      try {
        video = await mediaPrisma.video.findUnique({
          where: { id: mediaComponentId },
          select: {
            id: true,
            variants: {
              where:
                languageIds.length > 0
                  ? { languageId: { in: languageIds } }
                  : undefined,
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
            }
          }
        })
      } catch (error) {
        console.error(
          `Database error fetching video ${mediaComponentId}:`,
          error
        )
        throw error
      }

      if (!video || !video.variants || video.variants.length === 0) {
        return {
          data: {
            message: `Media component '${mediaComponentId}' languages not found!`,
            logref: 404
          },
          statusCode: 404
        }
      }

      const subtitleLanguageIds =
        video.subtitles?.map((s) => s.languageId) ?? []

      let languages = []
      if (subtitleLanguageIds.length > 0) {
        try {
          languages = await languagesPrisma.language.findMany({
            where: {
              id: { in: subtitleLanguageIds }
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
        subtitle: any,
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
        web: { vtt: 'srtSrc' }
      } as const

      const subtitlesByEdition = new Map<string, Record<string, any[]>>()
      if (video?.subtitles?.length > 0) {
        const config = subtitleConfig[platform as keyof typeof subtitleConfig]

        const subtitleGroups = new Map<string, any[]>()
        for (const subtitle of video.subtitles) {
          const edition = subtitle.edition || 'default'
          if (!subtitleGroups.has(edition)) {
            subtitleGroups.set(edition, [])
          }
          subtitleGroups.get(edition)!.push(subtitle)
        }

        for (const [edition, subtitles] of subtitleGroups) {
          const editionUrls: Record<string, any[]> = {}
          for (const [format, urlField] of Object.entries(config)) {
            editionUrls[format] = subtitles.map((subtitle) =>
              createSubtitleWithLanguageInfo(subtitle, urlField)
            )
          }
          subtitlesByEdition.set(edition, editionUrls)
        }
      }

      const buildDownloadUrls = (downloads: any[], apiKey?: string) => {
        if (!downloads || downloads.length === 0) return {}

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
        const downloadHigh = findDownloadWithFallback(
          normalizedDownloads,
          'high',
          apiKey
        )

        const result: any = {}
        if (downloadLow) {
          result.low = {
            url: downloadLow.url,
            sizeInBytes: downloadLow.size
          }
        }
        if (downloadHigh) {
          result.high = {
            url: downloadHigh.url,
            sizeInBytes: downloadHigh.size
          }
        }
        return result
      }

      const getStreamingUrls = (platform: string, variant: any) => {
        if (!variant.hls) return {}

        const baseEntry = { videoBitrate: 0, url: variant.hls }

        switch (platform) {
          case 'android':
            return {
              dash: variant.dash
                ? [{ videoBitrate: 0, url: variant.dash }]
                : [],
              hls: [baseEntry],
              http: []
            }
          case 'ios':
            return {
              m3u8: [baseEntry],
              http: []
            }
          default: // 'web'
            return {}
        }
      }

      const mediaComponentLanguage = video.variants.map((variant) => {
        const downloadUrls = buildDownloadUrls(variant.downloads, apiKey)
        const streamingUrls = getStreamingUrls(platform, variant)

        const shareUrl =
          variant.share ??
          `https://arc.gt/s/${variant.id}/${variant.languageId}`

        const webEmbedPlayer = getWebEmbedPlayer(variant.id, apiSessionId)
        const webEmbedSharePlayer = getWebEmbedSharePlayer(
          variant.id,
          apiSessionId
        )

        const variantEdition = variant.edition ?? 'base'
        const editionSubtitleUrls = subtitlesByEdition.get(variantEdition) ?? {}

        return {
          mediaComponentId,
          languageId: Number(variant.languageId),
          refId: variant.id,
          lengthInMilliseconds: variant?.lengthInMilliseconds ?? 0,
          edition: variant.edition,
          subtitleUrls: editionSubtitleUrls,
          downloadUrls,
          streamingUrls,
          shareUrl,
          socialMediaUrls: {},
          ...(platform === 'web' && {
            webEmbedPlayer,
            webEmbedSharePlayer,
            openGraphVideoPlayer: 'https://jesusfilm.org/'
          }),
          _links: {
            self: {
              href: `http://api.arclight.org/v2/media-components/${mediaComponentId}/languages/${variant.languageId}?platform=${platform}&apiKey=${apiKey}`
            },
            mediaComponent: {
              href: `http://api.arclight.org/v2/media-components/${mediaComponentId}?apiKey=${apiKey}`
            },
            mediaLanguage: {
              href: `http://api.arclight.org/v2/media-languages/${variant.languageId}/?apiKey=${apiKey}`
            }
          }
        }
      })

      return {
        data: {
          mediaComponentId,
          platform,
          apiSessionId,
          _links: {
            self: {
              href: c.req.url
            },
            mediaComponent: {
              href: `http://api.arclight.org/v2/media-components/${mediaComponentId}`
            }
          },
          _embedded: {
            mediaComponentLanguage
          }
        },
        statusCode: 200
      }
    }
  )

  return c.json(cachedData, statusCode as 200 | 404 | 500)
})
