/* eslint-disable i18next/no-literal-string */

import { graphql } from 'gql.tada'

import { getApolloClient } from '../../lib/apolloClient'

import { VideoPlayer } from './VideoPlayer'

const GET_VIDEO_VARIANT = graphql(`
  query GetVideoVariant($id: ID!) {
    videoVariants(input: { id: $id }) {
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
  searchParams: { refId?: string }
}) {
  if (!searchParams.refId) {
    return <div>Missing refId parameter</div>
  }

  const { data } = await getApolloClient().query({
    query: GET_VIDEO_VARIANT,
    variables: { id: searchParams.refId }
  })

  const { data: videoTitleData } = await getApolloClient().query({
    query: GET_VIDEO_TITLE,
    variables: { id: data?.videoVariants?.[0]?.videoId ?? '' }
  })

  const hlsUrl = data?.videoVariants?.[0]?.hls
  const videoTitle = videoTitleData?.video?.title?.[0]?.value
  const thumbnail = videoTitleData?.video?.images?.[0]?.mobileCinematicHigh
  if (!hlsUrl) {
    return <div>No video URL found for ID: {searchParams.refId}</div>
  }

  return (
    <div className="w-full h-full min-h-[360px]">
      <VideoPlayer
        hlsUrl={hlsUrl}
        videoTitle={videoTitle}
        thumbnail={thumbnail}
      />
    </div>
  )
}
