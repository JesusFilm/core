import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useEdit } from '../../_EditProvider'
import { Section } from '../Section'

import { StudyQuestionsList } from './StudyQuestionsList'
import { VideoDescription } from './VideoDescription'
import { VideoImage } from './VideoImage'
import { VideoImageAlt } from './VideoImageAlt'
import { VideoInformation } from './VideoInformation'
import { VideoSnippet } from './VideoSnippet'

interface MetadataProps {
  video: AdminVideo
  loading: boolean
}

export function Metadata({ video, loading }: MetadataProps): ReactElement {
  const t = useTranslations()
  const {
    state: { isEdit }
  } = useEdit()

  return (
    <Stack gap={2} data-testid="VideoMetadata">
      {loading ? (
        <Box sx={{ height: 240, display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Section title={t('Information')}>
            <VideoInformation />
          </Section>
          <Section title={t('Image')}>
            <Stack gap={2}>
              <VideoImageAlt />
              <VideoImage video={video} isEdit={isEdit} />
            </Stack>
          </Section>
          <Section title={t('Snippet')}>
            <VideoSnippet videoSnippets={video?.snippet} />
          </Section>
          <Section title={t('Description')}>
            <VideoDescription videoDescriptions={video?.description} />
          </Section>
          <StudyQuestionsList studyQuestions={video?.studyQuestions} />
        </>
      )}
    </Stack>
  )
}
