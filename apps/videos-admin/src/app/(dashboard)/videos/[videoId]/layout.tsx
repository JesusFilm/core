'use client'

import { useSuspenseQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import { useSelectedLayoutSegment } from 'next/navigation'
import { ReactNode } from 'react'

import { PublishedChip } from '../../../../components/PublishedChip'
import { Section } from '../../../../components/Section'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../constants'

import { VideoDescription } from './_description'
import { VideoViewFallback } from './_fallback'
import { VideoImageAlt } from './_imageAlt'
import { VideoInformation } from './_information'
import { LockedVideoView } from './_locked'
import { VideoSnippet } from './_snippet'
import { VideoTabView } from './_tabs'

const GET_TAB_DATA = graphql(`
  query GetTabData($id: ID!, $languageId: ID!) {
    adminVideo(id: $id) {
      id
      locked
      published
      title(languageId: $languageId) {
        id
        value
      }
    }
  }
`)

interface VideoViewLayoutProps {
  children: ReactNode
  images: ReactNode
  studyQuestions: ReactNode
  params: {
    videoId: string
  }
}

export default function VideoViewLayout({
  children,
  images,
  studyQuestions,
  params: { videoId }
}: VideoViewLayoutProps): ReactNode {
  // keep metadata visible when modal is open
  const availableTabs = ['metadata', 'audio', 'children', 'editions']
  const segment = useSelectedLayoutSegment()
  const currentTab = availableTabs.includes(segment ?? '')
    ? (segment as string)
    : 'metadata'

  const { data } = useSuspenseQuery(GET_TAB_DATA, {
    variables: {
      id: videoId,
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
  const videoTitle = video?.title?.[0]?.value ?? ''

  return (
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
          <VideoTabView currentTab={currentTab} videoId={videoId} />
          {currentTab !== 'metadata' ? (
            children
          ) : (
            <>
              <Divider sx={{ mb: 4 }} />
              <Stack gap={2} data-testid="VideoMetadata">
                <Section title="Information" variant="outlined">
                  <VideoInformation videoId={videoId} />
                </Section>
                <Section title="Images" variant="outlined">
                  <Stack gap={4}>
                    {images}
                    <VideoImageAlt videoId={videoId} />
                  </Stack>
                </Section>
                <Section title="Short Description" variant="outlined">
                  <VideoSnippet videoId={videoId} />
                </Section>
                <Section title="Description" variant="outlined">
                  <VideoDescription videoId={videoId} />
                </Section>
                {studyQuestions}
              </Stack>
            </>
          )}
        </Box>
      </Stack>
    </Stack>
  )
}
