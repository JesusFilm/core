import { useSuspenseQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { graphql } from 'gql.tada'
import { ReactElement } from 'react'

import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../libs/useAdminVideo/useAdminVideo'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../_VideoView/constants'
import { Section } from '../_VideoView/Section'

import { StudyQuestionsList } from './StudyQuestionsList'
import { VideoDescription } from './VideoDescription'
import { VideoImage } from './VideoImage'
import { VideoImageAlt } from './VideoImageAlt'
import { VideoInformation } from './VideoInformation'
import { VideoSnippet } from './VideoSnippet'

interface CloudflareImage {
  id: string
  url?: string | null
  mobileCinematicHigh?: string | null
}

interface ImageAlt {
  id: string
  value?: string | null
}

interface VideoData {
  id: string
  images: CloudflareImage[]
  imageAlt: ImageAlt[]
  snippet: any[]
  description: any[]
}

interface MetadataProps {
  params: {
    videoId: string
  }
}

const GET_VIDEO_METADATA = graphql(`
  query GetVideoMetadata($id: ID!, $languageId: ID!) {
    adminVideo(id: $id) {
      id
      title(languageId: $languageId) {
        id
        value
      }
      snippet(languageId: $languageId) {
        id
        value
      }
      description(languageId: $languageId) {
        id
        value
      }
      imageAlt(languageId: $languageId) {
        id
        value
      }
    }
  }
`)

export default function Metadata({ params }: MetadataProps): ReactElement {
  const { videoId } = params
  const { data } = useSuspenseQuery(GET_VIDEO_METADATA, {
    variables: {
      id: videoId,
      languageId: DEFAULT_VIDEO_LANGUAGE_ID
    }
  })

  const video = data.adminVideo

  return (
    <Stack gap={2} data-testid="VideoMetadata">
      <Section title="Information" variant="outlined">
        <VideoInformation video={video} />
      </Section>
      <Section title="Images" variant="outlined">
        <Stack gap={4}>
          <VideoImage videoId={video.id} />
          <VideoImageAlt videoImageAlts={video.imageAlt} />
        </Stack>
      </Section>
      <Section title="Short Description" variant="outlined">
        <VideoSnippet videoSnippets={video.snippet} />
      </Section>
      <Section title="Description" variant="outlined">
        <VideoDescription videoDescriptions={video.description} />
      </Section>
      <StudyQuestionsList videoId={video.id} />
    </Stack>
  )
}
