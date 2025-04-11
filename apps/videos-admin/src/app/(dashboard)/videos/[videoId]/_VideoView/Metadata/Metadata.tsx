import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../libs/useAdminVideo/useAdminVideo'
import { Section } from '../Section'

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
  video: AdminVideo
}

export function Metadata({ video }: MetadataProps): ReactElement {
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
