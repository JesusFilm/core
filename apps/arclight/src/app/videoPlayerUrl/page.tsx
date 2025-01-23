/* eslint-disable i18next/no-literal-string */

import { graphql } from 'gql.tada'

import { getApolloClient } from '../../lib/apolloClient'

import { VideoPlayer } from './VideoPlayer'

const GET_VIDEO_VARIANT = graphql(`
  query GetVideoVariant($id: ID!) {
    videoVariants(input: { id: $id }) {
      id
      hls
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

  const hlsUrl = data?.videoVariants?.[0]?.hls
  if (!hlsUrl) {
    return <div>No video URL found for ID: {searchParams.refId}</div>
  }

  return (
    <div className="w-full h-full min-h-[360px]">
      <VideoPlayer hlsUrl={hlsUrl} />
    </div>
  )
}
