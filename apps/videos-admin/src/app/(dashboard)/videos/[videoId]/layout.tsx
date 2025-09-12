'use client'

import { useSuspenseQuery } from '@apollo/client'
import DeleteIcon from '@mui/icons-material/Delete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useParams, useRouter, useSelectedLayoutSegment } from 'next/navigation'
import { ReactNode } from 'react'

import { graphql } from '@core/shared/gql'

import { PublishedChip } from '../../../../components/PublishedChip'
import { Section } from '../../../../components/Section'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../constants'

import { LockedVideoView } from './_LockedVideo'
import { RestrictedDownloads } from './_RestrictedDownloads'
import { RestrictedViews } from './_RestrictedViews'
import { VideoBibleCitation } from './_VideoBibleCitation'
import { VideoDescription } from './_VideoDescription'
import { VideoViewFallback } from './_VideoFallback'
import { VideoImageAlt } from './_VideoImageAlt'
import { VideoImages } from './_VideoImages'
import { VideoInformation } from './_VideoInformation'
import { VideoSnippet } from './_VideoSnippet'
import { VideoTabView } from './_VideoTabs'

const GET_TAB_DATA = graphql(`
  query GetTabData($id: ID!, $languageId: ID!) {
    adminVideo(id: $id) {
      id
      locked
      published
      publishedAt
      title(languageId: $languageId) {
        id
        value
      }
    }
  }
`)

interface VideoViewLayoutProps {
  children: ReactNode
  studyQuestions: ReactNode
}

export default function VideoViewLayout({
  children,
  studyQuestions
}: VideoViewLayoutProps): ReactNode {
  const router = useRouter()
  const { videoId } = useParams() as { videoId: string }
  // keep metadata visible when modal is open
  const availableTabs = ['metadata', 'audio', 'children', 'editions']
  const segment = useSelectedLayoutSegment() ?? 'metadata'
  const currentTab = availableTabs.includes(segment ?? '')
    ? segment
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

  // Show delete button only for videos that have never been published
  const canDelete = video.publishedAt == null

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
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between'
        }}
      >
        <Stack
          gap={2}
          sx={{
            alignItems: { xs: 'start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <Typography variant="h4">{videoTitle}</Typography>
          <PublishedChip published={video.published} />
        </Stack>
        {canDelete && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              router.push(`/videos/${videoId}/delete`, {
                scroll: false
              })
            }}
            sx={{
              alignSelf: { xs: 'stretch', sm: 'center' },
              whiteSpace: 'nowrap'
            }}
          >
            Delete Video
          </Button>
        )}
      </Stack>

      <Stack gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box width="100%">
          <VideoTabView currentTab={currentTab} videoId={videoId} />
          {currentTab == 'metadata' && (
            <>
              <Divider sx={{ mb: 4 }} />
              <Stack gap={2} data-testid="VideoMetadata">
                <Section title="Information" variant="outlined">
                  <VideoInformation videoId={videoId} />
                </Section>
                <Section title="Images" variant="outlined">
                  <Stack gap={4}>
                    <VideoImages videoId={videoId} />
                    <VideoImageAlt videoId={videoId} />
                  </Stack>
                </Section>
                <Section title="Short Description" variant="outlined">
                  <VideoSnippet videoId={videoId} />
                </Section>
                <Section title="Description" variant="outlined">
                  <VideoDescription videoId={videoId} />
                </Section>
                <VideoBibleCitation videoId={videoId} />
                {studyQuestions}
                <Section title="Restricted Downloads" variant="outlined">
                  <RestrictedDownloads videoId={videoId} />
                </Section>
                <Section title="Restricted Views" variant="outlined">
                  <RestrictedViews videoId={videoId} />
                </Section>
              </Stack>
            </>
          )}
          {children}
        </Box>
      </Stack>
    </Stack>
  )
}
