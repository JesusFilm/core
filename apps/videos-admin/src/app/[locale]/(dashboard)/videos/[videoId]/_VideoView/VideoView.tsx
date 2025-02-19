'use client'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement, SyntheticEvent, useState } from 'react'

import { PublishedChip } from '../../../../../../components/PublishedChip'
import { GetAdminVideo } from '../../../../../../libs/useAdminVideo'
import { VideoProvider } from '../../../../../../libs/VideoProvider'

import { Metadata } from './Metadata'
import { TabContainer } from './Tabs/TabContainer'
import { TabLabel } from './Tabs/TabLabel'
import { Variants } from './Variants'
import { VideoChildren } from './VideoChildren'
import { getVideoChildrenLabel } from './VideoChildren/getVideoChildrenLabel'

export function VideoView({
  video
}: {
  video: GetAdminVideo['adminVideo']
}): ReactElement {
  const t = useTranslations()

  const [tabValue, setTabValue] = useState(0)
  const videoTitle = video.title?.[0]?.value ?? ''

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
                      count={video?.children?.length}
                    />
                  }
                />
              )}
              <Tab
                value={2}
                label={
                  <TabLabel
                    label={t('Audio Languages')}
                    count={video?.variants?.length}
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
                  childVideos={video?.children ?? []}
                  label={videoLabel}
                />
              )}
            </TabContainer>
            <TabContainer value={tabValue} index={2}>
              <Variants variants={video?.variants} />
            </TabContainer>
          </Box>
        </Stack>
      </Stack>
    </VideoProvider>
  )
}
