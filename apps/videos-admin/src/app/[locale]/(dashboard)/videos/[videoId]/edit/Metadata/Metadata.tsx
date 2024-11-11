import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Form, Formik } from 'formik'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { FormCheckbox } from '../../../../../../../components/FormCheckbox'
import { FormSelect } from '../../../../../../../components/FormSelect'
import { FormTextArea } from '../../../../../../../components/FormTextArea'
import { FormTextField } from '../../../../../../../components/FormTextField'
import { Section } from '../../../../../../../components/Section'
import { GetAdminVideo } from '../../../../../../../libs/useAdminVideo'

import { getDirtyValues } from './formHelpers'
import { StudyQuestions } from './StudyQuestions'
import { VideoImage } from './VideoImage'

function Fallback({ loading }: { loading: boolean }): ReactElement {
  const t = useTranslations()

  return (
    <Box
      sx={{ height: 240, display: 'grid', placeItems: 'center' }}
      data-testid="VideoMetadataFallback"
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <Typography>{t('Video not found')}</Typography>
      )}
    </Box>
  )
}

function useUpdateMutation(mutation) {
  const [updateMutation] = useMutation(mutation)

  return (input) => {
    void updateMutation({
      variables: { input }
    })
  }
}

const videoLabels = [
  { label: 'Collection', value: 'collection' },
  { label: 'Episode', value: 'episode' },
  { label: 'Feature Film', value: 'featureFilm' },
  { label: 'Segment', value: 'segment' },
  { label: 'Series', value: 'series' },
  { label: 'Short Film', value: 'shortFilm' },
  { label: 'Trailer', value: 'trailer' },
  { label: 'Behind The Scenes', value: 'behindTheScenes' }
]

const videoStatuses = [
  { label: 'Published', value: 'published' },
  { label: 'Unpublished', value: 'unpublished' }
]

const VIDEO_TITLE_UPDATE = graphql(`
  mutation UpdateVideoTitle($input: VideoTranslationUpdateInput!) {
    videoTitleUpdate(input: $input) {
      id
    }
  }
`)

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

const VIDEO_UPDATE = graphql(`
  mutation UpdateVideo($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
      label
      published
      noIndex
    }
  }
`)

interface MetadataProps {
  video?: GetAdminVideo['adminVideo']
  loading: boolean
  reload: () => void
}

export function Metadata({
  video,
  loading,
  reload
}: MetadataProps): ReactElement {
  const t = useTranslations()
  const updateTitle = useUpdateMutation(VIDEO_TITLE_UPDATE)
  const updateDescription = useUpdateMutation(VIDEO_DESCRIPTION_UPDATE)
  const updateSnippet = useUpdateMutation(VIDEO_SNIPPET_UPDATE)
  const [updateVideo] = useMutation(VIDEO_UPDATE)

  const videoTitle = video?.title?.[0]
  const videoDescription = video?.description?.[0]
  const videoSnippet = video?.snippet?.[0]

  const initialValues = {
    video: {
      slug: video?.slug,
      published: video?.published === true ? 'published' : 'unpublished',
      label: video?.label,
      noIndex: video?.noIndex
    },
    title: videoTitle?.value,
    snippet: videoSnippet?.value,
    description: videoDescription?.value
  }

  if (video == null) return <Fallback loading={loading} />

  const handleSubmit = async (values): Promise<void> => {
    const dirty = getDirtyValues(values, initialValues)

    console.log(dirty.video)

    if (dirty.video != null) {
      void updateVideo({
        variables: {
          input: {
            id: video?.id,
            ...dirty.video,
            published: dirty.video.published === 'published'
          }
        }
      })
    }

    if (dirty.title != null) {
      void updateTitle({
        id: videoTitle?.id,
        value: dirty.title
      })
    }

    if (dirty.snippet != null) {
      updateSnippet({
        id: video?.snippet?.[0].id,
        value: dirty.snippet
      })
    }

    if (dirty.description != null) {
      updateDescription({
        id: videoDescription?.id,
        value: dirty.description
      })
    }
  }

  return (
    <Box
      gap={2}
      data-testid="VideoMetadata"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          xl: '1fr 400px'
        },
        gridTemplateRows: 'masonry',
        maxWidth: 1700
      }}
    >
      <Section title={t('Information')}>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ resetForm, dirty }) => (
            <Form>
              <Stack gap={2}>
                <Stack direction="row" gap={2}>
                  <FormTextField name="title" label={t('Title')} fullWidth />
                  <FormTextField
                    name="video.slug"
                    label={t('Slug')}
                    disabled
                    fullWidth
                  />
                </Stack>
                <Stack direction="row" alignItems="center" gap={2}>
                  <FormSelect
                    name="video.published"
                    label={t('Status')}
                    options={videoStatuses}
                    fullWidth
                  />

                  <FormSelect
                    name="video.label"
                    label={t('Label')}
                    options={videoLabels}
                    fullWidth
                  />
                </Stack>

                <FormCheckbox name="video.noIndex" label={t('No Index')} />

                <FormTextArea name="snippet" label={t('Snippet')} />

                <FormTextArea name="description" label={t('Description')} />
              </Stack>
              {dirty && (
                <Stack
                  direction="row"
                  gap={1}
                  sx={{ mt: 2, justifyContent: 'flex-end' }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => resetForm()}
                    disabled={!dirty}
                  >
                    {t('Cancel')}
                  </Button>
                  <Button variant="contained" type="submit">
                    {t('Save')}
                  </Button>
                </Stack>
              )}
            </Form>
          )}
        </Formik>
      </Section>

      <Section title={t('Image')}>
        <Stack gap={2}>
          <VideoImage video={video} />
        </Stack>
      </Section>

      <StudyQuestions studyQuestions={video?.studyQuestions} reload={reload} />
    </Box>
  )
}
