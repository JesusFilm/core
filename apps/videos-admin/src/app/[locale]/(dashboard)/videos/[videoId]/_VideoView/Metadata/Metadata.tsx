import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { Textarea } from '../../../../../../../components/Textarea'
import { Section } from '../Section'
import { UpdateableField } from '../UpdateableField'

import { StudyQuestions } from './StudyQuestions'
import { VideoImage } from './VideoImage'
import { VideoInformation } from './VideoInformation'

function useUpdateMutation(mutation) {
  const [updateMutation] = useMutation(mutation)

  return (input) => {
    void updateMutation({
      variables: { input }
    })
  }
}

const VIDEO_DESCRIPTION_UPDATE = graphql(`
  mutation UpdateVideoDescription($input: VideoTranslationUpdateInput!) {
    videoDescriptionUpdate(input: $input) {
      id
    }
  }
`)

const VIDEO_SNIPPET_UPDATE = graphql(`
  mutation UpdateVideoSnippet($input: VideoTranslationUpdateInput!) {
    videoSnippetUpdate(input: $input) {
      id
    }
  }
`)

const VIDEO_IMAGE_ALT_UPDATE = graphql(`
  mutation UpdateVideoImageAlt($input: VideoTranslationUpdateInput!) {
    videoImageAltUpdate(input: $input) {
      id
      value
    }
  }
`)

interface MetadataProps {
  video: any
  loading: boolean
  isEdit: boolean
}

export function Metadata({
  video,
  loading,
  isEdit
}: MetadataProps): ReactElement {
  const t = useTranslations()

  const updateDescription = useUpdateMutation(VIDEO_DESCRIPTION_UPDATE)
  const updateSnippet = useUpdateMutation(VIDEO_SNIPPET_UPDATE)
  const updateAlt = useUpdateMutation(VIDEO_IMAGE_ALT_UPDATE)

  return (
    <Stack gap={2} data-testid="VideoMetadata">
      {loading ? (
        <Box sx={{ height: 240, display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Section title="Information">
            <VideoInformation isEdit={isEdit} />
          </Section>
          <Section title={t('Image')}>
            <Stack gap={2}>
              <UpdateableField
                label="Alt"
                isEdit={isEdit}
                variant="textfield"
                {...video?.imageAlt?.[0]}
                handleUpdate={updateAlt}
              />
              <VideoImage video={video} isEdit={isEdit} />
            </Stack>
          </Section>

          <Section title={t('Snippet')}>
            <Textarea
              defaultValue={video?.snippet?.[0].value}
              onBlur={(e) =>
                updateSnippet({
                  id: video?.snippet?.[0].id,
                  value: e.target.value
                })
              }
              minRows={6}
              maxRows={6}
              sx={{ minWidth: '100%', maxWidth: '100%' }}
            />
          </Section>
          <Section title={t('Description')}>
            <Textarea
              defaultValue={video?.description?.[0].value}
              onBlur={(e) =>
                updateDescription({
                  id: video?.description?.[0].id,
                  value: e.target.value
                })
              }
              minRows={8}
              maxRows={8}
              sx={{ minWidth: '100%', maxWidth: '100%' }}
            />
          </Section>
          <StudyQuestions studyQuestions={video?.studyQuestions} />
        </>
      )}
    </Stack>
  )
}
