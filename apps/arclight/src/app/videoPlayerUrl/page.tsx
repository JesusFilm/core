import { graphql } from 'gql.tada'

import { getApolloClient } from '../../lib/apolloClient'

import { VideoPlayer } from './VideoPlayer'

const GET_VIDEO_VARIANT = graphql(`
  query GetVideoVariant($id: ID!) {
    videoVariant(id: $id) {
      id
      hls
      videoId
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
  searchParams: { refId?: string; start?: string; end?: string }
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
    variables: { id: searchParams.refId }
  })
  const { data: videoTitleData } = await getApolloClient().query({
    query: GET_VIDEO_TITLE,
    variables: { id: data?.videoVariant?.videoId ?? '' }
  })

  const hlsUrl = data?.videoVariant?.hls
  const videoTitle = videoTitleData?.video?.title?.[0]?.value
  const thumbnail = videoTitleData?.video?.images?.[0]?.mobileCinematicHigh
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
      />
    </div>
  )
}
