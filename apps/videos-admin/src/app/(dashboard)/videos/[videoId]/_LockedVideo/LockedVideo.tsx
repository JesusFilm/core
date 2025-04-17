'use client'

import { usePathname } from 'next/navigation'
import { ReactElement } from 'react'

import Lock1 from '@core/shared/ui/icons/Lock1'

import { Fallback } from '../../../../../components/Fallback'

const getVideosPath = (url: string | null): string => {
  if (!url) return '/videos'

  const parts = url.split('/')
  parts.pop()
  return parts.join('/')
}

export function LockedVideoView(): ReactElement {
  const pathname = usePathname()
  const backLink = getVideosPath(pathname)

  return (
    <Fallback
      icon={<Lock1 fontSize="large" />}
      title="Video is locked"
      subtitle="This video is currently locked to prevent edits"
      action={{
        href: backLink,
        label: 'Back to videos'
      }}
    />
  )
}
