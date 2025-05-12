import { graphql } from 'gql.tada'

import { getApolloClient } from '../../lib/apolloClient'

import { VideoPlayer } from './VideoPlayer'

const DEFAULT_SUB_LANGUGE_IDS = ['22658', '21754', '21753', '496', '21028']

const GET_VIDEO_VARIANT = graphql(`
  query GetVideoVariant($id: ID!, $includeSubtitles: Boolean!) {
    videoVariant(id: $id) {
      id
      hls
      videoId
      subtitle @include(if: $includeSubtitles) {
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
  searchParams: { refId?: string; start?: string; end?: string; subon?: string }
}) {
  if (!searchParams.refId) {
    return {
      message: 'Missing refId parameter',
      status: 404
    }
  }

  // Parse start and end times, ensuring they are valid numbers
  const startTime = searchParams.start ? Number(searchParams.start) : undefined
  const endTime = searchParams.end ? Number(searchParams.end) : undefined
  const subon = Boolean(searchParams.subon)
  const sublangids = searchParams.sublangids

  // Validate time parameters
  if (startTime != null && (isNaN(startTime) || startTime < 0)) {
    return {
      message: 'Invalid start time parameter',
      status: 400
    }
  }

  if (endTime != null && (isNaN(endTime) || endTime < 0)) {
    return {
      message: 'Invalid end time parameter',
      status: 400
    }
  }

  if (startTime != null && endTime != null && endTime <= startTime) {
    return {
      message: 'End time must be greater than start time',
      status: 400
    }
  }

  const { data } = await getApolloClient().query({
    query: GET_VIDEO_VARIANT,
    variables: {
      id: searchParams.refId,
      includeSubtitles: subon
    }
  })
  const { data: videoTitleData } = await getApolloClient().query({
    query: GET_VIDEO_TITLE,
    variables: { id: data?.videoVariant?.videoId ?? '' }
  })

  const acceptedSubLangIds = DEFAULT_SUB_LANGUGE_IDS.concat(
    sublangids?.split(',') ?? []
  )

  const hlsUrl = data?.videoVariant?.hls
  const videoTitle = videoTitleData?.video?.title?.[0]?.value
  const thumbnail = videoTitleData?.video?.images?.[0]?.mobileCinematicHigh
  const subtitles = subon
    ? data?.videoVariant?.subtitle
        ?.filter((subtitle) =>
          acceptedSubLangIds.includes(subtitle.language?.id ?? '')
        )
        .map((subtitle) => ({
          key: subtitle.id,
          language: subtitle.language?.name?.[0]?.value,
          bcp47: subtitle.language?.bcp47,
          vttSrc: subtitle.vttSrc
        }))
    : []

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
