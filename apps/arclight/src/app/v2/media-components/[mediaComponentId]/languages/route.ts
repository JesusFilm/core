import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../../lib/paramsToRecord'

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
  const apiSessionId = '6622f10d2260a8.05128925'

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_VIDEO_LANGUAGES>
  >({
    query: GET_VIDEO_LANGUAGES,
    variables: {
      id: mediaComponentId
    }
  })

  const mediaComponentLanguage =
    data.video?.variants == null
      ? []
      : data.video.variants.map((variant) => {
          const downloadLow = variant.downloads?.find(
            (download) => download.quality === 'low'
          )
          const downloadHigh = variant.downloads?.find(
            (download) => download.quality === 'high'
          )

          const subtitleUrls =
            platform === 'android'
              ? {
                  vtt:
                    variant.subtitle?.map((subtitle) => ({
                      languageId: Number(subtitle.language?.id),
                      languageName: subtitle.language?.name[0].value,
                      languageTag: subtitle.language?.bcp47,
                      url: subtitle.vttSrc
                    })) ?? [],
                  srt:
                    variant.subtitle?.map((subtitle) => ({
                      languageId: Number(subtitle.language?.id),
                      languageName: subtitle.language?.name[0].value,
                      languageTag: subtitle.language?.bcp47,
                      url: subtitle.srtSrc
                    })) ?? []
                }
              : {
                  vtt:
                    variant.subtitle?.map((subtitle) => ({
                      languageId: Number(subtitle.language?.id),
                      languageName: subtitle.language?.name[0].value,
                      languageTag: subtitle.language?.bcp47,
                      url: subtitle.vttSrc
                    })) ?? []
                }

          const streamingUrls =
            platform === 'web'
              ? {}
              : platform === 'android'
                ? {
                    dash: [{ videoBitrate: 0, url: variant.dash }],
                    hls: [{ videoBitrate: 0, url: variant.hls }],
                    http: []
                  }
                : {
                    m3u8: [{ videoBitrate: 0, url: variant.hls }],
                    http: []
                  }

          const url = `https://api.arclight.org/videoPlayerUrl?refId=${variant.id}&apiSessionId=${apiSessionId}&player=bc.vanilla6&dtm=0&playerStyle=vanilla`

          const cleanString = (str: string): string =>
            str.replace(/\s+/g, ' ').trim()

          const webEmbedPlayer =
            platform === 'web'
              ? cleanString(`
            <div class="arc-cont">
              <iframe src="${url}" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe>
              <style>
                .arc-cont {
                  position: relative;
                  display: block;
                  margin: 10px auto;
                  width: 100%;
                }
                .arc-cont:after {
                  padding-top: 59%;
                  display: block;
                  content: "";
                }
                .arc-cont > iframe {
                  position: absolute;
                  top: 0;
                  bottom: 0;
                  right: 0;
                  left: 0;
                  width: 98%;
                  height: 98%;
                  border: 0;
                }
              </style>
            </div>`)
              : undefined

          const webEmbedSharePlayer =
            platform === 'web'
              ? cleanString(`
            <div class="arc-cont">
              <iframe src="${url}" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe>
              <style>
                .arc-cont {
                  position: relative;
                  display: block;
                  margin: 10px auto;
                  width: 100%;
                }
                .arc-cont:after {
                  padding-top: 59%;
                  display: block;
                  content: "";
                }
                .arc-cont > iframe {
                  position: absolute;
                  top: 0;
                  bottom: 0;
                  right: 0;
                  left: 0;
                  width: 98%;
                  height: 98%;
                  border: 0;
                }
              </style>
            </div>`)
              : undefined

          return {
            mediaComponentId,
            languageId: Number(variant.language?.id),
            refId: variant.id,
            lengthInMilliseconds: variant.duration,
            subtitleUrls,
            downloadUrls: {
              low:
                downloadLow == null
                  ? undefined
                  : {
                      url: downloadLow.url,
                      sizeInBytes: downloadLow.size
                    },
              high:
                downloadHigh == null
                  ? undefined
                  : {
                      url: downloadHigh.url,
                      sizeInBytes: downloadHigh.size
                    }
            },
            streamingUrls,
            shareUrl: variant.share ?? '',
            socialMediaUrls: {},
            ...(platform === 'web' && {
              webEmbedPlayer,
              webEmbedSharePlayer
            }),
            // TODO: implement
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
