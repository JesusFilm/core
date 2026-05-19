'use client'

import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { usePathname, useRouter } from 'next/navigation'
import { ReactElement, SyntheticEvent } from 'react'

type VideosTabValue = 'library' | 'algolia'

function getCurrentTabValue(pathname: string): VideosTabValue {
  if (pathname.startsWith('/videos/algolia')) {
    return 'algolia'
  }

  return 'library'
}

export function VideosTabs(): ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const currentTabValue = getCurrentTabValue(pathname ?? '')

  const handleTabChange = (
    _event: SyntheticEvent,
    value: VideosTabValue
  ): void => {
    const nextPathname = value === 'algolia' ? '/videos/algolia' : '/videos'
    router.push(nextPathname)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={currentTabValue} onChange={handleTabChange}>
        <Tab value="library" label="Library" />
        <Tab value="algolia" label="Algolia (Experimental)" />
      </Tabs>
    </Box>
  )
}
