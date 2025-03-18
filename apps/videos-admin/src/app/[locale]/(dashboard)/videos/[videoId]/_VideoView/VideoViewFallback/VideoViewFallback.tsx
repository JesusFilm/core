'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { Fallback } from '../../../../../../../components/Fallback'

const getVideosPath = (url: string | null): string => {
  if (!url) return '/en/videos'

  const parts = url.split('/')
  parts.pop()
  return parts.join('/')
}

export function VideoViewFallback(): ReactElement {
  const t = useTranslations()
  const pathname = usePathname()

  return (
    <Fallback
      title={t('Video not found')}
      subtitle={t('Could not find the video you are looking for')}
      action={{
        href: getVideosPath(pathname),
        label: t('View Videos')
      }}
    />
  )
}
