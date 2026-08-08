'use client'

import { usePathname } from 'next/navigation'
import { ReactElement, ReactNode } from 'react'

import { VideosTabs } from './_VideosTabs'

interface VideosLayoutProps {
  children: ReactNode
}

export default function VideosLayout({
  children
}: VideosLayoutProps): ReactElement {
  const pathname = usePathname()
  const shouldRenderTabs =
    pathname === '/videos' ||
    pathname === '/videos/algolia' ||
    pathname === '/videos/library' ||
    pathname === '/videos/processing'

  return (
    <>
      {shouldRenderTabs && <VideosTabs />}
      {children}
    </>
  )
}
