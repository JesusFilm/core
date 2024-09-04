import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../../../lib/apolloClient'

/* TODO: 
  querystring:
    apiKey
    platform
    reduce (only for web)
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
        hls
        subtitle {
          language {
            id
            bcp47
            name(languageId: $languageId) {
              value
            }
          }
          vttSrc
          srtSrc
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

  const apiKey = query.get('apiKey') ?? '616db012e9a951.51499299'
  const platform = query.get('platform') ?? 'ios'

  if (data.video == null || data.video.variant == null)
    return new Response(null, { status: 404 })

  const video = data.video

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

  const subtitleUrls =
    platform === 'android'
      ? {
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
      : {
          vtt:
            video.variant?.subtitle?.map((subtitle) => ({
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
          // TODO: implement dash urls
          dash: [],
          hls: [{ videoBitrate: 0, url: video.variant?.hls }],
          http: []
        }
      : {
          m3u8: [{ videoBitrate: 0, url: video.variant?.hls }],
          http: []
        }

  const response = {
    mediaComponentId,
    languageId: Number(languageId),
    refId: video.variant?.id,
    // TODO create api session id
    apiSessionId: '',
    platform,
    lengthInMilliseconds: video.variant?.duration ?? 0,
    subtitleUrls,
    downloadUrls,
    streamingUrls,
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
        href: `https://api.arclight.com/v2/media-components/${mediaComponentId}/languages/${languageId}?platform=${platform}&apiKey=${apiKey}`
      },
      mediaComponent: {
        href: `https://api.arclight.com/v2/media-components/${mediaComponentId}?apiKey=${apiKey}`
      },
      mediaLanguage: {
        href: `https://api.arclight.com/v2/media-languages/${languageId}?apiKey=${apiKey}`
      }
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}
