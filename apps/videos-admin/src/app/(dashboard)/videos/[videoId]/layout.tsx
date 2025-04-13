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

import { VideoViewFallback } from './_fallback'
import { LockedVideoView } from './_locked'

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

interface VideoViewLayoutProps {
  children: ReactNode
  tabs: ReactNode
  description: ReactNode
  snippet: ReactNode
  imageAlt: ReactNode
  images: ReactNode
  information: ReactNode
  studyQuestions: ReactNode
  params: {
    videoId: string
  }
}

export default function VideoViewLayout({
  children,
  tabs,
  description,
  imageAlt,
  snippet,
  images,
  information,
  studyQuestions,
  params: { videoId }
}: VideoViewLayoutProps): ReactNode {
  const currentTab = useSelectedLayoutSegment() || 'metadata'

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
          {tabs}
          {currentTab !== 'metadata' ? (
            children
          ) : (
            <>
              <Divider sx={{ mb: 4 }} />
              <Stack gap={2} data-testid="VideoMetadata">
                <Section title="Information" variant="outlined">
                  {information}
                </Section>
                <Section title="Images" variant="outlined">
                  <Stack gap={4}>
                    {images}
                    {imageAlt}
                  </Stack>
                </Section>
                <Section title="Short Description" variant="outlined">
                  {snippet}
                </Section>
                <Section title="Description" variant="outlined">
                  {description}
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
