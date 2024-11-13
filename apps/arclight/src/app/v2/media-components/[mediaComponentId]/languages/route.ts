import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../../lib/paramsToRecord'
import {
  getWebEmbedPlayer,
  getWebEmbedSharePlayer
} from '../../../../../lib/stringsForArclight/webEmbedStrings'

const GET_VIDEO_LANGUAGES = graphql(`
  query GetVideoVariants($id: ID!) {
    video(id: $id) {
      id
      variants {
        id
        duration
        hls
        dash
        share
        subtitle {
          language {
            id
            name {
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

interface GetParams {
  params: { mediaComponentId: string }
}

export async function GET(
  request: NextRequest,
  { params }: GetParams
): Promise<Response> {
  const { mediaComponentId } = params
  const query = request.nextUrl.searchParams

  const apiKey = query.get('apiKey') ?? '616db012e9a951.51499299'
  const platform = query.get('platform') ?? 'ios'
  const languageIds = query.get('languageIds')?.split(',') ?? []
  const apiSessionId = '6622f10d2260a8.05128925'

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_VIDEO_LANGUAGES>
  >({
    query: GET_VIDEO_LANGUAGES,
    variables: {
      id: mediaComponentId
    }
  })
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
            const downloadLow = variant.downloads?.find(
              (download) => download.quality === 'low'
            )
            const downloadHigh = variant.downloads?.find(
              (download) => download.quality === 'high'
            )

            let downloadUrls = {}
            if (downloadLow != null || downloadHigh != null) {
              downloadUrls = {
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
                case 'web':
                  subtitleUrls = {
                    m3u8: variant.subtitle?.map((subtitle) => ({
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
                    m3u8: [{ videoBitrate: 0, url: variant.hls }],
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
              lengthInMilliseconds: variant.duration,
              subtitleUrls,
              downloadUrls,
              streamingUrls,
              shareUrl,
              socialMediaUrls: {},
              ...(platform === 'web' && {
                webEmbedPlayer,
                webEmbedSharePlayer
              }),
              openGraphVideoPlayer: 'https://jesusfilm.org/',
              _links: {
                self: {
                  href: `https://api.arclight.com/v2/media-components/${mediaComponentId}/languages/${variant.language?.id}?platform=${platform}&apiKey=${apiKey}`
                },
                mediaComponent: {
                  href: `https://api.arclight.com/v2/media-components/${mediaComponentId}?apiKey=${apiKey}`
                },
                mediaLanguage: {
                  href: `https://api.arclight.com/v2/media-languages/${variant.language?.id}/?apiKey=${apiKey}`
                }
              }
            }
          })

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  const queryString = new URLSearchParams(queryObject).toString()

  const response = {
    mediaComponentId,
    platform,
    apiSessionId,
    _links: {
      self: {
        href: `/v2/media-components/${mediaComponentId}/languages?${queryString}`
      },
      mediaComponent: {
        href: `/v2/media-components/${mediaComponentId}` // TODO: mediacomponent querystring
      }
    },
    _embedded: {
      mediaComponentLanguage
    }
  }
  return new Response(JSON.stringify(response), { status: 200 })
}
