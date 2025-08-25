import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

import { ResultOf, graphql } from '@core/shared/gql'

import { getApolloClient } from '../../../../../../../lib/apolloClient'
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

const GET_VIDEO_VARIANT = graphql(`
  query GetVideoWithVariant($id: ID!, $languageId: ID!) {
    video(id: $id) {
      id
      variant(languageId: $languageId) {
        id
        lengthInMilliseconds
        hls
        dash
        share
        subtitle {
          language {
            id
            bcp47
            name(languageId: "529") {
              value
            }
          }
          vttSrc
          srtSrc
        }
        downloads {
          height
          width
          quality
          size
          bitrate
          url
        }
      }
      children {
        id
        label
        primaryLanguageId
        variant {
          hls
          share
          lengthInMilliseconds
          downloadable
          downloads {
            height
            width
            quality
            size
            bitrate
            url
          }
          subtitle {
            language {
              id
              bcp47
              name(languageId: "529") {
                value
              }
            }
            vttSrc
            srtSrc
          }
        }
        images {
          thumbnail
          videoStill
          mobileCinematicHigh
          mobileCinematicLow
          mobileCinematicVeryLow
        }
        title(languageId: $languageId) {
          value
        }
        snippet(languageId: $languageId) {
          value
        }
        description(languageId: $languageId) {
          value
        }
        studyQuestions(languageId: $languageId) {
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
      }
    }
  }
`)

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
  const mediaComponentId = c.req.param('mediaComponentId')
  const languageId = c.req.param('languageId')
  const expand = c.req.query('expand') ?? ''
  const apiKey = c.req.query('apiKey')

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
    try {
      const { data } = await getApolloClient().query<
        ResultOf<typeof GET_VIDEO_VARIANT>
      >({
        query: GET_VIDEO_VARIANT,
        variables: {
          languageId,
          id: mediaComponentId
        }
      })

      const video = data.video

      if (video == null || video.variant == null) {
        return { notFound: true, type: 'video_or_variant_not_found' }
      }

      const downloadLow = findDownloadWithFallback(
        video.variant?.downloads,
        'low',
        apiKey
      )
      const downloadHigh = findDownloadWithFallback(
        video.variant?.downloads,
        'high',
        apiKey
      )
      const downloadSd = video.variant?.downloads?.find(
        (download) => download.quality === 'sd'
      )

      const downloadUrls = {
        low:
          downloadLow == null
            ? undefined
            : {
                url: downloadLow.url,
                height: downloadLow.height || 240,
                width: downloadLow.width || 426,
                sizeInBytes: downloadLow.size || 0
              },
        high:
          downloadHigh == null
            ? undefined
            : {
                url: downloadHigh.url,
                height: downloadHigh.height || 720,
                width: downloadHigh.width || 1280,
                sizeInBytes: downloadHigh.size || 0
              }
      }

      let webEmbedPlayer = ''
      let webEmbedSharePlayer = ''
      if (platform === 'web') {
        webEmbedPlayer = getWebEmbedPlayer(video.variant.id, apiSessionId)
        webEmbedSharePlayer = getWebEmbedSharePlayer(
          video.variant.id,
          apiSessionId
        )
      }

      let subtitleUrls = {}
      if (
        video.variant?.subtitle != null &&
        video.variant?.subtitle.length > 0
      ) {
        switch (platform) {
          case 'android':
            subtitleUrls = {
              vtt:
                video.variant?.subtitle
                  ?.map((subtitle) => ({
                    languageId: Number(subtitle.language?.id),
                    languageName: subtitle.language?.name?.[0]?.value ?? '',
                    languageTag: subtitle.language?.bcp47 ?? '',
                    url: subtitle.vttSrc
                  }))
                  .filter((s) => Boolean(s.url)) ?? [],
              srt:
                video.variant?.subtitle
                  ?.map((subtitle) => ({
                    languageId: Number(subtitle.language?.id),
                    languageName: subtitle.language?.name?.[0]?.value ?? '',
                    languageTag: subtitle.language?.bcp47 ?? '',
                    url: subtitle.srtSrc
                  }))
                  .filter((s) => Boolean(s.url)) ?? []
            }
            break
          case 'web':
          case 'ios':
            subtitleUrls = {
              vtt:
                video.variant?.subtitle
                  ?.map((subtitle) => ({
                    languageId: Number(subtitle.language?.id),
                    languageName: subtitle.language?.name?.[0]?.value ?? '',
                    languageTag: subtitle.language?.bcp47 ?? '',
                    url: subtitle.vttSrc
                  }))
                  .filter((s) => Boolean(s.url)) ?? [],
              srt: []
            }
        }
      }

      let streamingUrls = {}
      if (video.variant?.hls != null || video.variant?.dash != null) {
        switch (platform) {
          case 'android':
            streamingUrls = {
              dash: [{ videoBitrate: 0, url: video.variant?.dash }],
              hls: [{ videoBitrate: 0, url: video.variant?.hls }],
              http: [
                {
                  videoBitrate: downloadLow?.bitrate ?? 0,
                  videoContainer: 'MP4',
                  url: downloadLow?.url
                },
                {
                  videoBitrate: downloadSd?.bitrate ?? 0,
                  videoContainer: 'MP4',
                  url: downloadSd?.url
                },
                {
                  videoBitrate: downloadSd?.bitrate ?? 0,
                  videoContainer: 'MP4',
                  url: downloadSd?.url
                },
                {
                  videoBitrate: downloadSd?.bitrate ?? 0,
                  videoContainer: 'MP4',
                  url: downloadSd?.url
                },
                {
                  videoBitrate: downloadSd?.bitrate ?? 0,
                  videoContainer: 'MP4',
                  url: downloadSd?.url
                },
                {
                  videoBitrate: downloadHigh?.bitrate ?? 0,
                  videoContainer: 'MP4',
                  url: downloadHigh?.url
                }
              ]
            }
            break
          case 'ios':
            streamingUrls = {
              m3u8: [
                {
                  videoBitrate: 0,
                  videoContainer: 'M2TS',
                  url: video.variant?.hls
                }
              ],
              http: []
            }
            break
        }
      }

      return {
        data: {
          mediaComponentId,
          languageId: Number(languageId),
          refId: video.variant?.id,
          apiSessionId,
          platform,
          lengthInMilliseconds: video.variant?.lengthInMilliseconds ?? 0,
          subtitleUrls,
          downloadUrls,
          streamingUrls,
          shareUrl: video.variant?.share ?? '',
          socialMediaUrls: {},
          ...(platform === 'web' && {
            webEmbedPlayer,
            webEmbedSharePlayer
          }),
          openGraphVideoPlayer: 'https://jesusfilm.org/',
          _links: {
            self: {
              href: `http://api.arclight.org/v2/media-components/${mediaComponentId}/languages/${languageId}?platform=${platform}&apiKey=${apiKey}`
            },
            mediaComponent: {
              href: `http://api.arclight.org/v2/media-components/${mediaComponentId}?apiKey=${apiKey}`
            },
            mediaLanguage: {
              href: `http://api.arclight.org/v2/media-languages/${languageId}?apiKey=${apiKey}`
            }
          },
          ...(expand.includes('contains') &&
            video.children && {
              _embedded: {
                contains: video.children.map((child) => ({
                  mediaComponentId: child.id,
                  languageId: Number(languageId),
                  refId: `${child.id}_${languageId}-${child.label}`,
                  apiSessionId,
                  lengthInMilliseconds:
                    child.variant?.lengthInMilliseconds ?? 0,
                  subtitleUrls: {
                    vtt:
                      child.variant?.subtitle
                        ?.map((subtitle) => ({
                          languageId: Number(subtitle.language?.id),
                          languageName:
                            subtitle.language?.name?.[0]?.value ?? '',
                          languageTag: subtitle.language?.bcp47 ?? '',
                          url: subtitle.vttSrc
                        }))
                        .filter((s) => Boolean(s.url)) ?? [],
                    srt: []
                  },
                  downloadUrls: {
                    low: (() => {
                      const lowDownload = findDownloadWithFallback(
                        child.variant?.downloads,
                        'low',
                        apiKey
                      )
                      return (
                        lowDownload && {
                          url: lowDownload.url,
                          height: lowDownload.height || 240,
                          width: lowDownload.width || 426,
                          sizeInBytes: lowDownload.size || 0
                        }
                      )
                    })(),
                    high: (() => {
                      const highDownload = findDownloadWithFallback(
                        child.variant?.downloads,
                        'high',
                        apiKey
                      )
                      return (
                        highDownload && {
                          url: highDownload.url,
                          height: highDownload.height || 720,
                          width: highDownload.width || 1280,
                          sizeInBytes: highDownload.size || 0
                        }
                      )
                    })()
                  },
                  streamingUrls: {
                    m3u8: [
                      {
                        videoBitrate: 0,
                        videoContainer: 'M2TS',
                        url: child.variant?.hls ?? ''
                      }
                    ],
                    http: []
                  },
                  shareUrl: child.variant?.share ?? '',
                  socialMediaUrls: {},
                  _links: {
                    self: {
                      href: `http://api.arclight.org/v2/media-components/${child.id}/languages/${languageId}?apiKey=${apiKey}`
                    },
                    mediaComponent: {
                      href: `http://api.arclight.org/v2/media-components/${child.id}?apiKey=${apiKey}`
                    },
                    mediaLanguage: {
                      href: `http://api.arclight.org/v2/media-languages/${languageId}?apiKey=${apiKey}`
                    }
                  }
                }))
              }
            })
        },
        type: 'success'
      }
    } catch {
      return { notFound: true, type: 'error' }
    }
  })

  if (cachedData?.notFound) {
    return c.json(
      {
        message: `Media component '${mediaComponentId}' language '${languageId}' not found!`,
        logref: 404
      },
      404
    )
  }

  if (cachedData?.type === 'success') {
    return c.json(cachedData.data)
  }

  return c.json(
    {
      message: `Media component '${mediaComponentId}' language '${languageId}' not found!`,
      logref: 404
    },
    404
  )
})
