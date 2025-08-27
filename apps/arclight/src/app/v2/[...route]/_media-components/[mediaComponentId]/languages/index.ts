import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { timeout } from 'hono/timeout'

import { ResultOf, graphql } from '@core/shared/gql'

import { getApolloClient } from '../../../../../../lib/apolloClient'
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

const GET_VIDEO_LANGUAGES = graphql(`
  query GetVideoVariants($id: ID!) {
    video(id: $id) {
      id
      variants {
        id
        lengthInMilliseconds
        hls
        dash
        share
        subtitle {
          language {
            id
            name(languageId: "529") {
              value
            }
            bcp47
          }
          value
          vttSrc
          srtSrc
        }
        downloads {
          size
          quality
          url
          width
          height
        }
        language {
          id
        }
      }
    }
  }
`)

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
    platform = 'ios' // Default platform for this route
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
    let data
    try {
      const result = await getApolloClient().query<
        ResultOf<typeof GET_VIDEO_LANGUAGES>
      >({
        query: GET_VIDEO_LANGUAGES,
        variables: {
          id: mediaComponentId
        }
      })
      data = result.data
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return {
          data: {
            message: `Media component '${mediaComponentId}' languages not found!`,
            logref: 404
          },
          statusCode: 404
        }
      }
      throw error
    }

    if (data.video == null) {
      return {
        data: {
          message: `Media component '${mediaComponentId}' languages not found!`,
          logref: 404
        },
        statusCode: 404
      }
    }

    const video = data.video

    const mediaComponentLanguage =
      video?.variants == null
        ? []
        : video.variants
            .filter((variant) =>
              languageIds.length > 0
                ? languageIds.includes(variant.language?.id)
                : true
            )
            .map((variant) => {
              const downloadLow = findDownloadWithFallback(
                variant.downloads,
                'low',
                apiKey
              )
              const downloadHigh = findDownloadWithFallback(
                variant.downloads,
                'high',
                apiKey
              )

              let downloadUrls = {}
              if (downloadLow != null || downloadHigh != null) {
                downloadUrls = {
                  low:
                    downloadLow == null
                      ? undefined
                      : {
                          url: downloadLow.url,
                          sizeInBytes: downloadLow.size || 0
                        },
                  high:
                    downloadHigh == null
                      ? undefined
                      : {
                          url: downloadHigh.url,
                          sizeInBytes: downloadHigh.size || 0
                        }
                }
              }

              let subtitleUrls = {}
              if (variant.subtitle?.length > 0) {
                switch (platform) {
                  case 'android':
                    subtitleUrls = {
                      vtt: variant.subtitle?.map((subtitle) => ({
                        languageId: Number(subtitle.language?.id),
                        languageName: subtitle.language?.name[0].value,
                        languageTag: subtitle.language?.bcp47,
                        url: subtitle.vttSrc
                      })),
                      srt: variant.subtitle?.map((subtitle) => ({
                        languageId: Number(subtitle.language?.id),
                        languageName: subtitle.language?.name[0].value,
                        languageTag: subtitle.language?.bcp47,
                        url: subtitle.srtSrc
                      }))
                    }
                    break
                  case 'ios':
                    subtitleUrls = {
                      vtt: variant.subtitle?.map((subtitle) => ({
                        languageId: Number(subtitle.language?.id),
                        languageName: subtitle.language?.name[0].value,
                        languageTag: subtitle.language?.bcp47,
                        url: subtitle.vttSrc
                      }))
                    }
                    break
                  case 'web':
                    subtitleUrls = {
                      vtt: variant.subtitle?.map((subtitle) => ({
                        languageId: Number(subtitle.language?.id),
                        languageName: subtitle.language?.name[0].value,
                        languageTag: subtitle.language?.bcp47,
                        url: subtitle.srtSrc
                      }))
                    }
                    break
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
                      dash: [{ videoBitrate: 0, url: variant.dash }],
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
                shareUrl = `https://arc.gt/s/${variant.id}/${variant.language?.id}`
              }

              const webEmbedPlayer = getWebEmbedPlayer(variant.id, apiSessionId)
              const webEmbedSharePlayer = getWebEmbedSharePlayer(
                variant.id,
                apiSessionId
              )

              return {
                mediaComponentId,
                languageId: Number(variant.language?.id),
                refId: variant.id,
                lengthInMilliseconds: variant?.lengthInMilliseconds ?? 0,
                subtitleUrls,
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
                    href: `http://api.arclight.org/v2/media-components/${mediaComponentId}/languages/${variant.language?.id}?platform=${platform}&apiKey=${apiKey}`
                  },
                  mediaComponent: {
                    href: `http://api.arclight.org/v2/media-components/${mediaComponentId}?apiKey=${apiKey}`
                  },
                  mediaLanguage: {
                    href: `http://api.arclight.org/v2/media-languages/${variant.language?.id}/?apiKey=${apiKey}`
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

  return c.json(cachedData.data, cachedData.statusCode as 200 | 404 | 500)
})
