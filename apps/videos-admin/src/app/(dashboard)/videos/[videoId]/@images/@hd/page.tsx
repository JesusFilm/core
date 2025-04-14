'use client'

import { useSuspenseQuery } from '@apollo/client'
import { graphql } from 'gql.tada'

import { ImageAspectRatio } from '../../../constants'
import { ImageDisplay } from '../_display/ImageDisplay'

const GET_HD_IMAGE = graphql(`
  query GetBannerImage($id: ID!) {
    adminVideo(id: $id) {
      id
      images(aspectRatio: hd) {
        id
        videoStill
      }
    }
  }
`)

interface VideoHdProps {
  params: {
    videoId: string
  }
}

export default function VideoHd({ params: { videoId } }: VideoHdProps) {
  const { data } = useSuspenseQuery(GET_HD_IMAGE, {
    variables: {
      id: videoId
    }
  })
  return (
    <ImageDisplay
      src={
        data.adminVideo.images[0]?.videoStill
          ? data.adminVideo.images[0].videoStill
          : undefined
      }
      alt="HD image"
      title="HD image"
      aspectRatio={ImageAspectRatio.hd}
      videoId={videoId}
    />
  )
}
