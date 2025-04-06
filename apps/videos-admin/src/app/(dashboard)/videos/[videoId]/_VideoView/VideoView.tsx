'use client'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useParams } from 'next/navigation'
import { ReactElement, SyntheticEvent, useState } from 'react'

import { PublishedChip } from '../../../../../components/PublishedChip'
import { useAdminVideo } from '../../../../../libs/useAdminVideo'
import { VideoProvider } from '../../../../../libs/VideoProvider'

import { Editions } from './Editions'
import { LockedVideoView } from './LockedVideoView'
import { Metadata } from './Metadata'
import { TabContainer } from './Tabs/TabContainer'
import { TabLabel } from './Tabs/TabLabel'
import { Variants } from './Variants'
import { VideoChildren } from './VideoChildren'
import { getVideoChildrenLabel } from './VideoChildren/getVideoChildrenLabel'
import { VideoViewFallback } from './VideoViewFallback'
import { VideoViewLoading } from './VideoViewLoading'

export function VideoView(): ReactElement {
  const params = useParams<{ videoId: string }>()
  const [tabValue, setTabValue] = useState(0)

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

  function handleTabChange(_e: SyntheticEvent, newValue: number): void {
    setTabValue(newValue)
  }

  const showVideoChildren: boolean =
    video.label === 'collection' ||
    video.label === 'featureFilm' ||
    video.label === 'series'

  const videoLabel = getVideoChildrenLabel(video.label)

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
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="video-edit-tabs"
            >
              <Tab value={0} label={<TabLabel label="Metadata" />} />
              {showVideoChildren && videoLabel != null && (
                <Tab
                  value={1}
                  label={
                    <TabLabel
                      label={videoLabel}
                      count={video.children?.length}
                    />
                  }
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
              />
              <Tab
                value={3}
                label={
                  <TabLabel
                    label="Editions"
                    count={video.videoEditions?.length}
                  />
                }
              />
            </Tabs>
            <Divider sx={{ mb: 4 }} />
            <TabContainer value={tabValue} index={0}>
              <Metadata video={video} />
            </TabContainer>
            <TabContainer value={tabValue} index={1}>
              {showVideoChildren && videoLabel != null && (
                <VideoChildren
                  videoId={video?.id ?? ''}
                  childVideos={video.children ?? []}
                  label={videoLabel}
                />
              )}
            </TabContainer>
            <TabContainer value={tabValue} index={2}>
              <Variants
                variants={video?.variants}
                editions={video?.videoEditions}
              />
            </TabContainer>
            <TabContainer value={tabValue} index={3}>
              <Editions editions={video.videoEditions ?? []} />
            </TabContainer>
          </Box>
        </Stack>
      </Stack>
    </VideoProvider>
  )
}
