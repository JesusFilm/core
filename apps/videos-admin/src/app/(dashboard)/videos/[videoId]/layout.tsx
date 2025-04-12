'use client'

import { useSuspenseQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import { useParams, useRouter, useSelectedLayoutSegment } from 'next/navigation'
import { ReactNode } from 'react'

import { PublishedChip } from '../../../../components/PublishedChip'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../constants'

import { VideoViewFallback } from './_fallback'
import { LockedVideoView } from './_locked'
import { TabLabel } from './_tabs/TabLabel'
import { getVideoChildrenLabel } from './children/VideoChildren/getVideoChildrenLabel'

const GET_TAB_DATA = graphql(`
  query GetTabData($id: ID!, $languageId: ID!) {
    adminVideo(id: $id) {
      id
      childrenCount
      editionsCount
      locked
      label
      published
      title(languageId: $languageId) {
        id
        value
      }
      variantLanguagesCount
    }
  }
`)

export default function VideoViewLayout({
  children
}: {
  children: ReactNode
}): ReactNode {
  const params = useParams<{ videoId: string }>()
  const { data } = useSuspenseQuery(GET_TAB_DATA, {
    variables: {
      id: params?.videoId as string,
      languageId: DEFAULT_VIDEO_LANGUAGE_ID
    }
  })

  if (data.adminVideo == null) {
    return <VideoViewFallback />
  }

  const video = data.adminVideo

  if (video.locked) {
    return <LockedVideoView />
  }

  const currentTab = useSelectedLayoutSegment() || 'metadata'
  const router = useRouter()
  const videoTitle = video?.title?.[0]?.value ?? ''

  const showVideoChildren: boolean =
    video.label === 'collection' ||
    video.label === 'featureFilm' ||
    video.label === 'series'

  const videoLabel = getVideoChildrenLabel(video.label)

  const tabs = [
    {
      label: 'Metadata',
      value: 'metadata',
      count: null
    },
    {
      label: 'Audio Languages',
      value: 'audio',
      count: video.variantLanguagesCount
    },
    {
      label: 'Editions',
      value: 'editions',
      count: video.editionsCount
    }
  ]
  if (showVideoChildren && videoLabel != null) {
    tabs.splice(1, 0, {
      label: 'Children',
      value: 'children',
      count: video.childrenCount
    })
  }

  function handleTabChange(
    event: React.SyntheticEvent,
    newValue: number
  ): void {
    router.push(`/videos/${params?.videoId}/${newValue}`)
  }

  return (
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
            value={currentTab}
            aria-label="video-edit-tabs"
            onChange={handleTabChange}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={
                  <TabLabel label={tab.label} count={tab.count ?? undefined} />
                }
              />
            ))}
          </Tabs>
          <Divider sx={{ mb: 4 }} />
          {children}
        </Box>
      </Stack>
    </Stack>
  )
}
