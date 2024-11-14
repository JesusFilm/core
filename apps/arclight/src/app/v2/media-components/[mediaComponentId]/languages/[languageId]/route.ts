import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../../../lib/apolloClient'
import {
  getWebEmbedPlayer,
  getWebEmbedSharePlayer
} from '../../../../../../lib/stringsForArclight/webEmbedStrings'

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
        dash
        share
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
          height
          width
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
  // TODO: implement
  const apiSessionId = '6622f10d2260a8.05128925'

  const video = data.video

  if (video == null || video.variant == null)
    return new Response(null, { status: 404 })

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
          m3u8: [{ videoBitrate: 0, url: video.variant?.hls }],
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
    lengthInMilliseconds: video.variant?.duration ?? 0,
    subtitleUrls,
    downloadUrls,
    streamingUrls,
    shareUrl: video.variant?.share ?? '',
    // socialMediaUrls never implemented in arclight
    socialMediaUrls: {},
    ...(platform === 'web' && {
      webEmbedPlayer,
      webEmbedSharePlayer
    }),
    // openGraphVideoPlayer never implemented in arclight in languages/id
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
