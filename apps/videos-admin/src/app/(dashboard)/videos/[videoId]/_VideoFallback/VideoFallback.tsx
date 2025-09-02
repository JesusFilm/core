'use client'

import { usePathname } from 'next/navigation'
import { ReactElement } from 'react'

import { Fallback } from '../../../../../components/Fallback'

const getVideosPath = (url: string | null): string => {
  if (!url) return '/videos'

  const parts = url.split('/')
  parts.pop()
  return parts.join('/')
}

export function VideoViewFallback(): ReactElement {
  const pathname = usePathname()
  const backLink = getVideosPath(pathname)

  return (
    <Fallback
      title="Video not found"
      subtitle="The video you're looking for could not be found."
      action={{
        href: backLink,
        label: 'Back to videos'
      }}
    />
  )
}
