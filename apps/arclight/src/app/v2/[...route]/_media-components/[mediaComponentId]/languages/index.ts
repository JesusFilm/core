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

  const apiKey = c.req.query('apiKey')

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
    apiKey ?? '',
    apiSessionId,
    ...languageIds.slice(0, 20)
  ])

  const cachedData = await getWithStaleCache(cacheKey, async () => {
    const video = await mediaPrisma.video.findUnique({
      where: { id: mediaComponentId },
      include: {
        variants: {
          where: {
            ...(languageIds.length > 0
              ? { languageId: { in: languageIds } }
              : undefined)
          },
          include: {
            downloads: true
          }
        },
        subtitles: true
      }
    })

    if (!video) {
      return {
        data: {
          message: `Media component '${mediaComponentId}' languages not found!`,
          logref: 404
        },
        statusCode: 404
      }
    }

    const variantLanguageIds =
      video.variants?.map((v: any) => v.languageId) ?? []
    const subtitleLanguageIds =
      video.subtitles?.map((s: any) => s.languageId) ?? []
    const allLanguageIds = [...variantLanguageIds, ...subtitleLanguageIds]
    const languages = await languagesPrisma.language.findMany({
      where: {
        id: { in: allLanguageIds }
      },
      include: {
        name: {
          where: {
            languageId: { equals: '529' }
          }
        }
      }
    })

    // Create a lookup map for efficient language access
    const languageMap = new Map(languages.map((lang) => [lang.id, lang]))

    // Helper function to create subtitle object with language info
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

    let subtitleUrls = {}
    if (video?.subtitles?.length > 0) {
      const config = subtitleConfig[platform as keyof typeof subtitleConfig]
      if (config) {
        subtitleUrls = Object.entries(config).reduce(
          (acc, [format, urlField]) => {
            acc[format] = video.subtitles?.map((subtitle) =>
              createSubtitleWithLanguageInfo(subtitle, urlField)
            )
            return acc
          },
          {} as Record<string, any[]>
        )
      }
    }

    const mediaComponentLanguage = video.variants.map((variant) => {
      const downloadLow = findDownloadWithFallback(
        variant.downloads.map((d) => ({
          ...d,
          size: d.size ?? undefined,
          height: d.height ?? undefined,
          width: d.width ?? undefined,
          bitrate: d.bitrate ?? undefined
        })),
        'low',
        apiKey
      )
      const downloadHigh = findDownloadWithFallback(
        variant.downloads.map((d) => ({
          ...d,
          size: d.size ?? undefined,
          height: d.height ?? undefined,
          width: d.width ?? undefined,
          bitrate: d.bitrate ?? undefined
        })),
        'high',
        apiKey
      )

      let downloadUrls = {}
      if (downloadLow != null || downloadHigh != null) {
        downloadUrls = {
          ...(downloadLow != null && {
            low: {
              url: downloadLow.url,
              sizeInBytes: downloadLow.size || 0
            }
          }),
          ...(downloadHigh != null && {
            high: {
              url: downloadHigh.url,
              sizeInBytes: downloadHigh.size || 0
            }
          })
        }
      }

      let streamingUrls = {}
      if (variant.hls != null) {
        switch (platform) {
          case 'web':
            streamingUrls = {}
            break
          case 'android':
            streamingUrls = {
              dash: variant.dash
                ? [{ videoBitrate: 0, url: variant.dash }]
                : [],
              hls: [{ videoBitrate: 0, url: variant.hls }],
              http: []
            }
            break
          case 'ios':
            streamingUrls = {
              m3u8: [
                {
                  videoBitrate: 0,
                  url: variant.hls
                }
              ],
              http: []
            }
            break
        }
      }

      let shareUrl = variant.share
      if (shareUrl == null) {
        shareUrl = `https://arc.gt/s/${variant.id}/${variant.languageId}`
      }

      const webEmbedPlayer = getWebEmbedPlayer(variant.id, apiSessionId)
      const webEmbedSharePlayer = getWebEmbedSharePlayer(
        variant.id,
        apiSessionId
      )

      const editionSubtitleUrls = Object.entries(subtitleUrls).reduce(
        (acc, [format, subtitles]) => {
          acc[format] = subtitles.filter(
            (subtitle) => subtitle.edition === variant.edition
          )
          return acc
        },
        {} as Record<string, any[]>
      )

      console.log(editionSubtitleUrls)

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

    const queryObject = c.req.query()
    const queryString = new URLSearchParams(queryObject).toString()

    return {
      data: {
        mediaComponentId,
        platform,
        apiSessionId,
        _links: {
          self: {
            href: `http://api.arclight.org/v2/media-components/${mediaComponentId}/languages?${queryString}`
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
  })

  return c.json(cachedData, cachedData.statusCode as 200 | 404 | 500)
})
