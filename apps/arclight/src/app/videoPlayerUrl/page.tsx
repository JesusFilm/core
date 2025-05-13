import { graphql } from 'gql.tada'

import { getApolloClient } from '../../lib/apolloClient'

import { VideoPlayer } from './VideoPlayer'

const DEFAULT_SUB_LANGUAGE_IDS = [
  '529',
  '22658',
  '21754',
  '21753',
  '496',
  '21028'
]

const GET_VIDEO_VARIANT = graphql(`
  query GetVideoVariant($id: ID!) {
    videoVariant(id: $id) {
      id
      hls
      videoId
      subtitle {
        id
        language {
          id
          bcp47
          name(languageId: "529") {
            value
          }
        }
        vttSrc
      }
    }
  }
`)

const GET_VIDEO_TITLE = graphql(`
  query GetVideoTitle($id: ID!) {
    video(id: $id, idType: databaseId) {
      title {
        value
      }
      images {
        mobileCinematicHigh
      }
    }
  }
`)

export default async function Page({
  searchParams
}: {
  searchParams: {
    refId?: string
    start?: string
    end?: string
    subon?: string
    sublangids?: string
  }
}) {
  if (!searchParams.refId) {
    return {
      message: 'Missing refId parameter',
      status: 404
    }
  }

  // Parse start and end times
  const startTime = searchParams.start ? Number(searchParams.start) : undefined
  const endTime = searchParams.end ? Number(searchParams.end) : undefined
  const subon = searchParams.subon === 'true'
  const sublangids = searchParams.sublangids

  const { data } = await getApolloClient().query({
    query: GET_VIDEO_VARIANT,
    variables: {
      id: searchParams.refId
    }
  })
  const { data: videoTitleData } = await getApolloClient().query({
    query: GET_VIDEO_TITLE,
    variables: { id: data?.videoVariant?.videoId ?? '' }
  })

  const acceptedSubLangIds = DEFAULT_SUB_LANGUAGE_IDS.concat(
    sublangids?.split(',') ?? []
  )

  const hlsUrl = data?.videoVariant?.hls
  const videoTitle = videoTitleData?.video?.title?.[0]?.value
  const thumbnail = videoTitleData?.video?.images?.[0]?.mobileCinematicHigh
  const subtitles = data?.videoVariant?.subtitle
    ?.filter((subtitle) =>
      acceptedSubLangIds.includes(subtitle.language?.id ?? '')
    )
    .map((subtitle) => ({
      key: subtitle.id,
      language: subtitle.language?.name?.[0]?.value,
      bcp47: subtitle.language?.bcp47,
      vttSrc: subtitle.vttSrc
    }))

  if (!hlsUrl) {
    return {
      message: 'No video URL found for ID: ' + searchParams.refId,
      status: 404
    }
  }

  return (
    <div className="w-full h-full min-h-[360px]">
      <VideoPlayer
        hlsUrl={hlsUrl}
        videoTitle={videoTitle}
        thumbnail={thumbnail}
        startTime={startTime}
        endTime={endTime}
        subon={subon}
        subtitles={subtitles}
      />
    </div>
  )
}
