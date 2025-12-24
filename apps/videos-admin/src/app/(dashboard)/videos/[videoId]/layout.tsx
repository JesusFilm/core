'use client'

import { useSuspenseQuery } from '@apollo/client'
import DeleteIcon from '@mui/icons-material/Delete'
import PublishIcon from '@mui/icons-material/Publish'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useParams, useRouter, useSelectedLayoutSegment } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactNode, useCallback } from 'react'

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
      label
      title(languageId: $languageId) {
        id
        value
      }
    }
  }
`)

const GET_VIDEO_CHILDREN_FOR_PUBLISH = graphql(`
  query GetVideoChildrenForPublish($id: ID!) {
    adminVideo(id: $id) {
      id
      label
      children {
        id
        published
        variants(input: { onlyPublished: false }) {
          id
          published
          language {
            id
            name(primary: true) {
              value
            }
          }
        }
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
  const { enqueueSnackbar } = useSnackbar()
  const { videoId } = useParams<{ videoId: string }>()
  // keep metadata visible when modal is open
  const availableTabs = [
    'metadata',
    'audio',
    'children',
    'editions',
    'troubleshooting'
  ]
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

  const { data: childrenData, refetch: refetchChildren } = useSuspenseQuery(
    GET_VIDEO_CHILDREN_FOR_PUBLISH,
    {
      variables: { id: videoId }
    }
  )

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

  // Check if video has children (collections, series, feature films)
  const hasChildren =
    video.label === 'collection' ||
    video.label === 'series' ||
    video.label === 'featureFilm'

  // Get unpublished children for publish all functionality
  const unpublishedChildren =
    childrenData?.adminVideo?.children?.filter((child) => !child.published) ??
    []

  const handlePublishAllClick = useCallback(() => {
    if (unpublishedChildren.length === 0) {
      enqueueSnackbar('No unpublished children to publish', {
        variant: 'info'
      })
      return
    }
    router.push(`/videos/${videoId}/publishAll`, { scroll: false })
  }, [enqueueSnackbar, router, unpublishedChildren.length, videoId])

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
        <Stack direction="row" spacing={1}>
          {hasChildren && unpublishedChildren.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<PublishIcon />}
              onClick={handlePublishAllClick}
              sx={{
                alignSelf: { xs: 'stretch', sm: 'center' },
                whiteSpace: 'nowrap'
              }}
            >
              Publish All
            </Button>
          )}
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
