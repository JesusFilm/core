import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
    platform
    reduce
    expand
    metadataLanguageTags
*/

interface GetParams {
  params: { mediaComponentId: string; languageId: string }
}

const GET_VIDEO_VARIANT = graphql(`
  query GetVideoWithVariant($id: ID!, $languageId: ID!) {
    video(id: $id) {
      id
      variant(languageId: $languageId) {
        id
        duration
        subtitle {
          language {
            id
            bcp47
            name(languageId: $languageId) {
              value
            }
          }
          value
        }
        downloads {
          quality
          size
          url
        }
      }
    }
  }
`)

export async function GET(
  req: NextRequest,
  { params }: GetParams
): Promise<Response> {
  const { mediaComponentId, languageId } = params
  const query = req.nextUrl.searchParams

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_VIDEO_VARIANT>
  >({
    query: GET_VIDEO_VARIANT,
    variables: {
      languageId,
      id: mediaComponentId
    }
  })

  if (data.video == null) return new Response(null, { status: 404 })

  const video = data.video

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }
  const queryString = new URLSearchParams(queryObject).toString()

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
            // TODO: handle size
            height: 180,
            width: 320,
            sizeInBytes: downloadLow.size
          },
    high:
      downloadHigh == null
        ? undefined
        : {
            url: downloadHigh.url,
            // TODO: handle size
            height: 180,
            width: 320,
            sizeInBytes: downloadHigh.size
          }
  }

  const response = {
    mediaComponentId,
    languageId,
    // TODO: create reference id
    refId: '123',
    // TODO create api session id
    apiSessionId: '',
    // TODO handle platform
    platform: 'web',
    lengthInMilliseconds: video.variant?.duration ?? 0,
    // TODO: investigate other formats
    subtitleUrls: {
      vtt:
        video.variant?.subtitle?.map((subtitle) => ({
          languageId: subtitle.language.id,
          languageName: subtitle.language.name[0].value,
          languageTag: subtitle.language.bcp47,
          url: subtitle.value
        })) ?? []
    },
    downloadUrls,
    // TODO: implement
    streamingUrls: {},
    // TODO: implement
    shareUrl: 'https://arc.gt/8un8j?apiSessionId=6622f10d2260a8.05128925',
    // TODO: implement
    socialMediaUrls: {},
    // TODO: implement
    webEmbedPlayer: '',
    // TODO: implement
    webEmbedSharePlayer: '',
    // TODO: investigate
    openGraphVideoPlayer: 'https://jesusfilm.org/',
    _links: {
      self: {
        href: `https://api.arclight.com/v2/media-components/${mediaComponentId}/languages/${languageId}?${queryString}`
      },
      // TODO handle querystring
      mediaComponent: {
        href: `https://api.arclight.com/v2/media-components/${mediaComponentId}`
      },
      // TODO handle querystring
      mediaLanguage: {
        href: `https://api.arclight.com/v2/media-languages/${languageId}`
      }
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}
