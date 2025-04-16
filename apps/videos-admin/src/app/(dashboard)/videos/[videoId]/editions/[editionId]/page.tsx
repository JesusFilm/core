'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik } from 'formik'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'
import Plus2 from '@core/shared/ui/icons/Plus2'

import { ActionButton } from '../../../../../../components/ActionButton'
import { FormTextField } from '../../../../../../components/FormTextField'
import { SaveButton } from '../../../../../../components/SaveButton'
import { Section } from '../../../../../../components/Section'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../../constants'

const GET_EDITION = graphql(`
  query GetEdition($editionId: ID!, $languageId: ID!) {
    videoEdition(id: $editionId) {
      id
      name
      videoSubtitles {
        id
        primary
        language {
          id
          name(languageId: $languageId, primary: true) {
            value
          }
        }
      }
    }
  }
`)

const UPDATE_VIDEO_EDITION = graphql(`
  mutation UpdateVideoEdition($input: VideoEditionUpdateInput!) {
    videoEditionUpdate(input: $input) {
      id
      name
    }
  }
`)

interface EditEditionPageProps {
  params: {
    videoId: string
    editionId: string
  }
}

export default function EditEditionPage({
  params: { videoId, editionId }
}: EditEditionPageProps) {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const { data } = useSuspenseQuery(GET_EDITION, {
    variables: { editionId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })

  const [updateEdition] = useMutation(UPDATE_VIDEO_EDITION)

  const validationSchema = object().shape({
    name: string().required('Name is required')
  })

  const handleSubmit = async (values: { name: string }) => {
    await updateEdition({
      variables: {
        input: {
          id: editionId,
          name: values.name
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Edition updated successfully.', {
          variant: 'success'
        })
        router.push(`/videos/${videoId}/editions`, {
          scroll: false
        })
      },
      onError: () => {
        enqueueSnackbar('Something went wrong.', { variant: 'error' })
      }
    })
  }
  const initialValues = { name: data.videoEdition?.name ?? '' }

  return (
    <Dialog
      open={true}
      onClose={() =>
        router.push(`/videos/${videoId}/editions`, {
          scroll: false
        })
      }
      dialogTitle={{
        title: 'Edit Edition',
        closeButton: true
      }}
    >
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({ values, errors, handleChange, isValid, isSubmitting, dirty }) => (
          <Form data-testId="EditionForm" style={{ marginBottom: 16 }}>
            <Stack gap={2}>
              <TextField
                id="name"
                name="name"
                label="Name"
                fullWidth
                value={values.name}
                variant="outlined"
                error={Boolean(errors.name)}
                onChange={handleChange}
                helperText={errors.name as string}
                sx={{ flexGrow: 1, mt: 1 }}
                disabled={values.name === 'base'}
              />
              <Stack direction="row" justifyContent="end">
                <SaveButton
                  disabled={!isValid || isSubmitting || !dirty || !values.name}
                />
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
      <Section
        title="Subtitles"
        action={{
          label: 'New Subtitle',
          onClick: () =>
            router.push(
              `/videos/${videoId}/editions/${editionId}/subtitle/add`,
              {
                scroll: false
              }
            ),
          startIcon: <Plus2 />
        }}
      >
        {(data.videoEdition?.videoSubtitles.length ?? 0) > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              minHeight: 200
            }}
          >
            {data.videoEdition?.videoSubtitles.map((subtitle) => (
              <Box
                sx={{
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  minWidth: 200,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    borderColor: 'action.hover',
                    cursor: 'pointer'
                  },
                  maxHeight: 95
                }}
                onClick={() =>
                  router.push(
                    `/videos/${videoId}/editions/${editionId}/subtitle/${subtitle.id}`,
                    {
                      scroll: false
                    }
                  )
                }
              >
                <Stack
                  sx={{
                    p: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant="h6">
                    {subtitle.language.name[0].value}
                  </Typography>
                  <ActionButton
                    actions={{
                      edit: () =>
                        router.push(
                          `/videos/${videoId}/editions/${editionId}/subtitles/${subtitle.id}`,
                          {
                            scroll: false
                          }
                        ),
                      delete: () =>
                        router.push(
                          `/videos/${videoId}/editions/${editionId}/subtitles/${subtitle.id}/delete`,
                          {
                            scroll: false
                          }
                        )
                    }}
                  />
                </Stack>
                <Stack direction="row" alignItems="center" gap={1}>
                  {subtitle.primary && (
                    <Chip label="Primary" color="success" variant="filled" />
                  )}
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'grid', placeItems: 'center', height: 200 }}>
            <Typography>No subtitles</Typography>
          </Box>
        )}
      </Section>
    </Dialog>
  )
}
