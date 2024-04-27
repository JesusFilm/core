import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
    platform
    languageIds
    reduce
    metadataLanguageTags
  graphql:
    missing variants type call
*/

const GET_VIDEO_LANGUAGES = graphql(`
  query GetVideoVariants($id: ID!) {
    video(id: $id) {
      id
      # Needs variants call, using variant just for mapping
      variant {
        id
        duration
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
          quality
          size
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

  const platform = query.get('platform') ?? 'web'
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
    data.video?.variant == null
      ? []
      : [data.video.variant].map((variant) => ({
          mediaComponentId,
          languageId: variant.language?.id,
          // Todo: calculate
          refId: variant.id,
          lengthInMilliseconds: variant.duration,
          subtitleUrls: {
            vtt: variant.subtitle?.map((subtitle) => ({
              languageId: subtitle.language?.id,
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
          // TODO: evaluate
          streamingUrls: {},
          // TODO: implement
          shareUrl: 'https://arc.gt/8un8j?apiSessionId=6622f10d2260a8.05128925',
          // TODO: implement
          webEmbedPlayer: '',
          // TODO: implement
          webEmbedSharePlayer: '',
          // TODO: investigate
          openGraphVideoPlayer: 'https://jesusfilm.org/',
          _links: {
            // TODO: handle querystring
            self: {
              href: `https://api.arclight.com/v2/media-components/${mediaComponentId}/languages/${variant.language?.id}`
            },
            // TODO handle querystring
            mediaComponent: {
              href: `https://api.arclight.com/v2/media-components/${mediaComponentId}`
            },
            // TODO handle querystring
            mediaLanguage: {
              href: `https://api.arclight.com/v2/media-languages/${variant.language?.id}`
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
