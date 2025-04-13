'use client'

import { useSuspenseQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import { useParams } from 'next/navigation'
import { ReactNode } from 'react'

import { PublishedChip } from '../../../../components/PublishedChip'
import { getVideoChildrenLabel } from '../../../../libs/getVideoChildrenLabel'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../constants'

import { VideoViewFallback } from './_fallback'
import { LockedVideoView } from './_locked'
import { VideoTabView } from './_tabs/TabView'

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

export default function VideoViewLayout({ children }): ReactNode {
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
      count: null,
      href: `/videos/${params?.videoId}`
    },
    {
      label: 'Audio Languages',
      value: 'audio',
      count: video.variantLanguagesCount,
      href: `/videos/${params?.videoId}/audio`
    },
    {
      label: 'Editions',
      value: 'editions',
      count: video.editionsCount,
      href: `/videos/${params?.videoId}/editions`
    }
  ]
  if (showVideoChildren && videoLabel != null) {
    tabs.splice(1, 0, {
      label: 'Children',
      value: 'children',
      count: video.childrenCount,
      href: `/videos/${params?.videoId}/children`
    })
  }

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
          <VideoTabView tabs={tabs} children={children} />
        </Box>
      </Stack>
    </Stack>
  )
}
