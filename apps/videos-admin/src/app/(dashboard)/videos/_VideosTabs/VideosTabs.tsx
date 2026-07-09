'use client'

import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { usePathname, useRouter } from 'next/navigation'
import { ReactElement, SyntheticEvent } from 'react'

type VideosTabValue = 'library' | 'algolia' | 'statusPipeline'

function getCurrentTabValue(pathname: string): VideosTabValue {
  if (pathname.startsWith('/videos/library')) {
    return 'library'
  }

  if (pathname.startsWith('/videos/status-pipeline')) {
    return 'statusPipeline'
  }

  return 'algolia'
}

export function VideosTabs(): ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const currentTabValue = getCurrentTabValue(pathname ?? '')

  const handleTabChange = (
    _event: SyntheticEvent,
    value: VideosTabValue
  ): void => {
    const nextPathname =
      value === 'algolia'
        ? '/videos'
        : value === 'statusPipeline'
          ? '/videos/status-pipeline'
          : '/videos/library'
    router.push(nextPathname)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={currentTabValue} onChange={handleTabChange}>
        <Tab value="algolia" label="Algolia Search" />
        <Tab value="library" label="Library (Backup)" />
        <Tab value="statusPipeline" label="Status Pipeline" />
      </Tabs>
    </Box>
  )
}
