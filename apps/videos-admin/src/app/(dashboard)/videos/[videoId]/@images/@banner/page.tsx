'use client'

import { useSuspenseQuery } from '@apollo/client'
import { graphql } from 'gql.tada'

import { ImageAspectRatio } from '../../../constants'
import { ImageDisplay } from '../_display/ImageDisplay'

const GET_BANNER_IMAGE = graphql(`
  query GetBannerImage($id: ID!) {
    adminVideo(id: $id) {
      id
      images(aspectRatio: banner) {
        id
        url
        videoStill
        aspectRatio
      }
    }
  }
`)

interface VideoBannerProps {
  params: {
    videoId: string
  }
}

export default function VideoBanner({ params: { videoId } }: VideoBannerProps) {
  const { data } = useSuspenseQuery(GET_BANNER_IMAGE, {
    variables: {
      id: videoId
    }
  })
  return (
    <ImageDisplay
      src={data.adminVideo.images[0].url ?? undefined}
      alt="banner image"
      title="banner image"
      aspectRatio={ImageAspectRatio.banner}
      videoId={videoId}
    />
  )
}
