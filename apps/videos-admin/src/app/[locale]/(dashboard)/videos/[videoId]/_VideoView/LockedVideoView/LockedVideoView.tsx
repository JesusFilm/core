import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import Lock1 from '@core/shared/ui/icons/Lock1'

import { Fallback } from '../../../../../../../components/Fallback'

const getVideosPath = (url: string | null): string => {
  if (!url) return '/en/videos'

  const parts = url.split('/')
  parts.pop()
  return parts.join('/')
}

export function LockedVideoView(): ReactElement {
  const t = useTranslations()
  const pathname = usePathname()

  return (
    <Fallback
      icon={<Lock1 fontSize="large" />}
      title={t('Video is locked')}
      subtitle={t('This video is currently locked to prevent edits')}
      action={{
        href: getVideosPath(pathname),
        label: t('View Videos')
      }}
    />
  )
}
