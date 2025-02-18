import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { ResultOf, graphql } from 'gql.tada'

import { getApolloClient } from '../../../../../../../lib/apolloClient'
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
          url
        }
      }
      children {
        id
        label
        primaryLanguageId
        variant {
          hls
          lengthInMilliseconds
          downloadable
          downloads {
            height
            width
            quality
            size
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
  apiKey: z.string(),
  platform: z.string(),
  languageIds: z.string(),
  reduce: z.string()
})

const ParamsSchema = z.object({
  mediaComponentId: z.string(),
  languageId: z.string()
})

const ResponseSchema = z.object({
  mediaComponentId: z.string(),
  languageId: z.string(),
  refId: z.string(),
  apiSessionId: z.string()
})

const route = createRoute({
  method: 'get',
  path: '/',
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
      description: 'media component language'
    }
  }
})

mediaComponentLanguage.openapi(route, async (c) => {
  const mediaComponentId = c.req.param('mediaComponentId')
  const languageId = c.req.param('languageId')
  const expand = c.req.query('expand') ?? ''

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_VIDEO_VARIANT>
  >({
    query: GET_VIDEO_VARIANT,
    variables: {
      languageId,
      id: mediaComponentId
    }
  })

  const apiKey = c.req.query('apiKey') ?? '616db012e9a951.51499299'
  const platform = c.req.query('platform') ?? 'ios'
  // TODO: implement
  const apiSessionId = '6622f10d2260a8.05128925'

  const video = data.video

  if (video == null || video.variant == null) return c.notFound()

  const downloadLow = video.variant?.downloads?.find(
    (download) => download.quality === 'low'
  )
  const downloadHigh = video.variant?.downloads?.find(
    (download) => download.quality === 'high'
  )

  const downloadUrls = {
    low:
      downloadLow == null
        ? undefined
        : {
            url: downloadLow.url,
            height: downloadLow.height,
            width: downloadLow.width,
            sizeInBytes: downloadLow.size
          },
    high:
      downloadHigh == null
        ? undefined
        : {
            url: downloadHigh.url,
            height: downloadHigh.height,
            width: downloadHigh.width,
            sizeInBytes: downloadHigh.size
          }
  }

  const webEmbedPlayer = getWebEmbedPlayer(video.variant.id, apiSessionId)
  const webEmbedSharePlayer = getWebEmbedSharePlayer(
    video.variant.id,
    apiSessionId
  )

  let subtitleUrls = {}
  if (video.variant?.subtitle != null && video.variant?.subtitle.length > 0) {
    switch (platform) {
      case 'android':
        subtitleUrls = {
          vtt:
            video.variant?.subtitle?.map((subtitle) => ({
              languageId: Number(subtitle.language?.id),
              languageName: subtitle.language?.name[0].value,
              languageTag: subtitle.language?.bcp47,
              url: subtitle.vttSrc
            })) ?? [],
          srt:
            video.variant?.subtitle?.map((subtitle) => ({
              languageId: Number(subtitle.language?.id),
              languageName: subtitle.language?.name[0].value,
              languageTag: subtitle.language?.bcp47,
              url: subtitle.srtSrc
            })) ?? []
        }
        break
      case 'web':
      case 'ios':
        subtitleUrls = {
          vtt:
            video.variant?.subtitle?.map((subtitle) => ({
              languageId: Number(subtitle.language?.id),
              languageName: subtitle.language?.name[0].value,
              languageTag: subtitle.language?.bcp47,
              url: subtitle.vttSrc
            })) ?? []
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
          http: []
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

  const response = {
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
            lengthInMilliseconds: child.variant?.lengthInMilliseconds ?? 0,
            subtitleUrls: {
              vtt:
                child.variant?.subtitle?.map((subtitle) => ({
                  languageId: Number(subtitle.language?.id),
                  languageName: subtitle.language?.name[0].value,
                  languageTag: subtitle.language?.bcp47,
                  url: subtitle.vttSrc
                })) ?? []
            },
            downloadUrls: {
              low: child.variant?.downloads?.find(
                (d) => d.quality === 'low'
              ) && {
                url: `https://arc.gt/${Math.random().toString(36).substring(2, 7)}?apiSessionId=${apiSessionId}`,
                height:
                  child.variant.downloads.find((d) => d.quality === 'low')
                    ?.height ?? 240,
                width:
                  child.variant.downloads.find((d) => d.quality === 'low')
                    ?.width ?? 426,
                sizeInBytes:
                  child.variant.downloads.find((d) => d.quality === 'low')
                    ?.size ?? 0
              },
              high: child.variant?.downloads?.find(
                (d) => d.quality === 'high'
              ) && {
                url: `https://arc.gt/${Math.random().toString(36).substring(2, 7)}?apiSessionId=${apiSessionId}`,
                height:
                  child.variant.downloads.find((d) => d.quality === 'high')
                    ?.height ?? 720,
                width:
                  child.variant.downloads.find((d) => d.quality === 'high')
                    ?.width ?? 1280,
                sizeInBytes:
                  child.variant.downloads.find((d) => d.quality === 'high')
                    ?.size ?? 0
              }
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
            shareUrl: `https://arc.gt/${Math.random().toString(36).substring(2, 7)}?apiSessionId=${apiSessionId}`,
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
  }

  return c.json(response)
})
