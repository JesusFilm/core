'use client'

import { useSuspenseQuery } from '@apollo/client'
import { graphql } from 'gql.tada'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ImageAspectRatio } from '../../../constants'
import { ImageDisplay } from '../_ImageDisplay/ImageDisplay'

const GET_BANNER_IMAGE = graphql(`
  query GetBannerImage($id: ID!) {
    adminVideo(id: $id) {
      id
      images(aspectRatio: banner) {
        id
        mobileCinematicHigh
      }
    }
  }
`)

interface VideoBannerProps {
  videoId: string
}

export function BannerImage({ videoId }: VideoBannerProps) {
  const pathname = usePathname()
  const [reloadOnPathChange, setReloadOnPathChange] = useState(false)

  const { data, refetch } = useSuspenseQuery(GET_BANNER_IMAGE, {
    variables: {
      id: videoId
    }
  })

  // Handle potential null/undefined values
  const imageUrl =
    data?.adminVideo?.images?.[0]?.mobileCinematicHigh ?? undefined

  // refresh image if banner image may have changed
  useEffect(() => {
    if (reloadOnPathChange) void refetch()
    setReloadOnPathChange(pathname?.includes('image/banner') ?? false)
  }, [pathname])

  return (
    <ImageDisplay
      src={imageUrl}
      alt="banner image"
      title="banner image"
      aspectRatio={ImageAspectRatio.banner}
      videoId={videoId}
    />
  )
}
