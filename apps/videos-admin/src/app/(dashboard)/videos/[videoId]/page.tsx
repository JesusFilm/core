'use client'

import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useParams } from 'next/navigation'
import { ReactElement } from 'react'

import { Section } from '../../../../components/Section'

import { VideoDescription } from './_description/VideoDescription'
import VideoImageAlt from './_imageAlt/VideoImageAlt'
import VideoImage from './_images/VideoImage'
import VideoInformation from './_information/VideoInformation'
import { VideoSnippet } from './_snippet/VideoSnippet'
import StudyQuestionsList from './_studyQuestions/StudyQuestionsList'

export default function VideoViewPage(): ReactElement {
  const params = useParams<{ videoId: string }>()
  const videoId = params?.videoId
  return (
    <>
      {videoId && (
        <>
          <Divider sx={{ mb: 4 }} />
          <Stack gap={2} data-testid="VideoMetadata">
            <Section title="Information" variant="outlined">
              <VideoInformation videoId={videoId} />
            </Section>
            <Section title="Images" variant="outlined">
              <Stack gap={4}>
                <VideoImage videoId={videoId} />
                <VideoImageAlt videoId={videoId} />
              </Stack>
            </Section>
            <Section title="Short Description" variant="outlined">
              <VideoSnippet videoId={videoId} />
            </Section>
            <Section title="Description" variant="outlined">
              <VideoDescription videoId={videoId} />
            </Section>
            <StudyQuestionsList videoId={videoId} />
          </Stack>
        </>
      )}
    </>
  )
}
