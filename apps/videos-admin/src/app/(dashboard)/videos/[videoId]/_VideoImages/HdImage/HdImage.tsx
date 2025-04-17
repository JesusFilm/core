'use client'

import { useSuspenseQuery } from '@apollo/client'
import { graphql } from 'gql.tada'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ImageAspectRatio } from '../../../constants'
import { ImageDisplay } from '../_ImageDisplay/ImageDisplay'

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
  videoId: string
}

export function HdImage({ videoId }: VideoHdProps) {
  const pathname = usePathname()
  const [reloadOnPathChange, setReloadOnPathChange] = useState(false)

  const { data, refetch } = useSuspenseQuery(GET_HD_IMAGE, {
    variables: {
      id: videoId
    }
  })

  // Handle potential null/undefined values
  const imageUrl = data?.adminVideo?.images?.[0]?.videoStill ?? undefined

  // refresh image if banner image may have changed
  useEffect(() => {
    if (reloadOnPathChange) void refetch()
    setReloadOnPathChange(pathname?.includes('image/hd') ?? false)
  }, [pathname])
  return (
    <ImageDisplay
      src={imageUrl}
      alt="HD image"
      title="HD image"
      aspectRatio={ImageAspectRatio.hd}
      videoId={videoId}
    />
  )
}
