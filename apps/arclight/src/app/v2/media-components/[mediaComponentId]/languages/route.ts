import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
    platform (web, ios, android)
    languageIds
    reduce
    metadataLanguageTags
*/

const GET_VIDEO_LANGUAGES = graphql(`
  query GetVideoVariants($id: ID!) {
    video(id: $id) {
      id
      variants {
        id
        duration
        hls
        subtitle {
          language {
            id
            name {
              value
            }
            bcp47
          }
          value
        }
        downloads {
          height
          width
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
  const apiSessionId = query.get('apiSessionId') ?? 'default'

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
      : data.video.variants.map((variant) => ({
          mediaComponentId,
          languageId: variant.language?.id,
          // Todo: calculate
          refId: variant.id,
          lengthInMilliseconds: variant.duration,
          subtitleUrls: {
            vtt: variant.subtitle?.map((subtitle) => ({
              languageId: Number(subtitle.language?.id),
              languageName: subtitle.language?.name[0].value,
              languageTag: subtitle.language?.bcp47,
              url: subtitle.value
            }))
          },
          downloadUrls: {
            low: variant.downloads?.find(
              (download) => download.quality === 'low'
            ),
            high: variant.downloads?.find(
              (download) => download.quality === 'high'
            )
          },
          streamingUrls:
            platform === 'web'
              ? {}
              : platform === 'android'
              ? {
                  // TODO: implement dash urls
                  dash: [],
                  hls: [{ videoBitrate: 0, url: variant.hls }],

                  http: []
                }
              : {
                  m3u8: [{ videoBitrate: 0, url: variant.hls }],
                  http: []
                },
          // TODO: implement
          shareUrl: 'https://arc.gt/8un8j?apiSessionId=6622f10d2260a8.05128925',

          // Below fields are only on web
          // TODO: implement
          webEmbedPlayer: '',
          // TODO: implement
          webEmbedSharePlayer: '',
          // TODO: investigate
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
        }))

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  const queryString = new URLSearchParams(queryObject).toString()

  const response = {
    mediaComponentId,
    platform,
    // Todo: create session Id
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
