'use client'

import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { ReactElement, ReactNode } from 'react'

import { TabLabel } from './TabLabel'

type VideoTabViewProps = {
  tabs: {
    label: string
    value: string
    count: number | null
    href: string
  }[]
  children: ReactNode
}
export function VideoTabView({
  tabs,
  children
}: VideoTabViewProps): ReactElement {
  // get the current tab from the url in an RSC
  const currentTab = useSelectedLayoutSegment() || 'metadata'

  return (
    <>
      <Tabs value={currentTab} aria-label="video-edit-tabs">
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={
              <TabLabel label={tab.label} count={tab.count ?? undefined} />
            }
            component={Link}
            href={tab.href}
          />
        ))}
      </Tabs>
      {children}
    </>
  )
}
