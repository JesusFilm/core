'use client'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ReactNode } from 'react'

import { PublishedChip } from '../../../../components/PublishedChip'
import { useAdminVideo } from '../../../../libs/useAdminVideo'
import { VideoProvider } from '../../../../libs/VideoProvider'

import { LockedVideoView } from './_VideoView/LockedVideoView'
import { TabLabel } from './_VideoView/Tabs/TabLabel'
import { getVideoChildrenLabel } from './_VideoView/VideoChildren/getVideoChildrenLabel'
import { VideoViewFallback } from './_VideoView/VideoViewFallback'
import { VideoViewLoading } from './_VideoView/VideoViewLoading'

export default function VideoViewLayout({
  children
}: {
  children: ReactNode
}): ReactNode {
  const params = useParams<{ videoId: string }>()
  const pathname = usePathname()

  // Extract the current tab from pathname
  const tabPath = pathname?.split('/').pop() || ''

  const { data, loading } = useAdminVideo({
    variables: { videoId: params?.videoId as string }
  })

  if (loading) {
    return <VideoViewLoading />
  }

  if (data?.adminVideo == null) {
    return <VideoViewFallback />
  }

  if (data.adminVideo.locked) {
    return <LockedVideoView />
  }

  const video = data.adminVideo
  const videoTitle = video?.title?.[0]?.value ?? ''

  const showVideoChildren: boolean =
    video.label === 'collection' ||
    video.label === 'featureFilm' ||
    video.label === 'series'

  const videoLabel = getVideoChildrenLabel(video.label)

  // Map tab paths to indices for MUI Tabs component
  const tabPathToIndex: Record<string, number> = {
    '': 0,
    metadata: 0,
    children: 1,
    audio: 2,
    editions: 3
  }

  const currentTabIndex = tabPathToIndex[tabPath] ?? 0

  return (
    <VideoProvider video={video}>
      <Stack
        gap={2}
        sx={{ width: '100%', maxWidth: 1700 }}
        data-testid="VideoView"
      >
        {data != null && (
          <Stack
            gap={2}
            sx={{
              mb: 2,
              alignItems: { xs: 'start', sm: 'center' },
              flexDirection: { xs: 'col', sm: 'row' }
            }}
          >
            <Typography variant="h4">{videoTitle}</Typography>
            <PublishedChip published={video.published} />
          </Stack>
        )}
        <Stack gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box width="100%">
            <Tabs value={currentTabIndex} aria-label="video-edit-tabs">
              <Tab
                value={0}
                label={<TabLabel label="Metadata" />}
                component={Link}
                href={`/videos/${params?.videoId}`}
              />
              {showVideoChildren && videoLabel != null && (
                <Tab
                  value={1}
                  label={
                    <TabLabel
                      label={videoLabel}
                      count={video.children?.length}
                    />
                  }
                  component={Link}
                  href={`/videos/${params?.videoId}/children`}
                />
              )}
              <Tab
                value={2}
                label={
                  <TabLabel
                    label="Audio Languages"
                    count={video.variants?.length}
                  />
                }
                component={Link}
                href={`/videos/${params?.videoId}/audio`}
              />
              <Tab
                value={3}
                label={
                  <TabLabel
                    label="Editions"
                    count={video.videoEditions?.length}
                  />
                }
                component={Link}
                href={`/videos/${params?.videoId}/editions`}
              />
            </Tabs>
            <Divider sx={{ mb: 4 }} />
            {children}
          </Box>
        </Stack>
      </Stack>
    </VideoProvider>
  )
}
