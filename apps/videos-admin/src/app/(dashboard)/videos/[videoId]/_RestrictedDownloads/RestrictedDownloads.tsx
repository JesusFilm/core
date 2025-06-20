'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FormLabel from '@mui/material/FormLabel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikProps, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { CancelButton } from '../../../../../components/CancelButton'
import { SaveButton } from '../../../../../components/SaveButton'

interface RestrictedDownloadsProps {
  videoId: string
}

export const GET_RESTRICTED_DOWNLOADS = graphql(`
  query GetRestrictedDownloads($id: ID!) {
    adminVideo(id: $id) {
      id
    }
  }
`)

export const UPDATE_RESTRICTED_DOWNLOADS = graphql(`
  mutation UpdateRestrictedDownloads($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
    }
  }
`)

const platformOptions = [
  { value: 'arclight', label: 'Arclight' },
  { value: 'watch', label: 'Watch' }
] as const

export function RestrictedDownloads({
  videoId
}: RestrictedDownloadsProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [updateRestrictedDownloads] = useMutation(UPDATE_RESTRICTED_DOWNLOADS)

  const { data } = useSuspenseQuery(GET_RESTRICTED_DOWNLOADS, {
    variables: { id: videoId }
  })

  async function handleUpdateRestrictedDownloads(
    values: FormikValues,
    { resetForm }: FormikProps<FormikValues>
  ): Promise<void> {
    await updateRestrictedDownloads({
      variables: {
        input: {
          id: videoId
          // TODO: Add blockDownloadPlatforms when schema is updated
          // blockDownloadPlatforms: values.blockDownloadPlatforms
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Successfully updated restricted downloads', {
          variant: 'success'
        })
        void resetForm({ values })
      },
      onError: () => {
        enqueueSnackbar('Failed to update restricted downloads', {
          variant: 'error'
        })
      }
    })
  }

  return (
    <Formik
      initialValues={{
        blockDownloadPlatforms: [] // TODO: Replace with data.adminVideo.blockDownloadPlatforms when schema is updated
      }}
      onSubmit={handleUpdateRestrictedDownloads}
    >
      {({ values, setFieldValue, isSubmitting, dirty, resetForm }) => (
        <Form>
          <Stack gap={2}>
            <Stack gap={1}>
              <Typography variant="body2" color="text.secondary">
                Select platforms where downloads should be blocked for this
                video. When a platform is selected, users accessing from that
                platform will not see any download options.
              </Typography>
              <Typography
                variant="body2"
                color="warning.main"
                sx={{ fontStyle: 'italic' }}
              >
                Note: This feature is currently under development. Changes will
                not be saved until the backend schema is updated.
              </Typography>
              <FormControl component="fieldset" variant="standard">
                <FormLabel component="legend">Blocked Platforms</FormLabel>
                <FormGroup>
                  {platformOptions.map((platform) => (
                    <FormControlLabel
                      key={platform.value}
                      control={
                        <Checkbox
                          checked={values.blockDownloadPlatforms.includes(
                            platform.value
                          )}
                          onChange={(event) => {
                            const currentPlatforms =
                              values.blockDownloadPlatforms
                            if (event.target.checked) {
                              void setFieldValue('blockDownloadPlatforms', [
                                ...currentPlatforms,
                                platform.value
                              ])
                            } else {
                              void setFieldValue(
                                'blockDownloadPlatforms',
                                currentPlatforms.filter(
                                  (p) => p !== platform.value
                                )
                              )
                            }
                          }}
                          name={`blockDownloadPlatforms.${platform.value}`}
                        />
                      }
                      label={platform.label}
                    />
                  ))}
                </FormGroup>
              </FormControl>
              {values.blockDownloadPlatforms.length > 0 && (
                <Typography variant="body2" color="warning.main">
                  Downloads are currently blocked for:{' '}
                  {values.blockDownloadPlatforms.join(', ')}
                </Typography>
              )}
            </Stack>
            <Divider sx={{ mx: -4 }} />
            <Stack direction="row" justifyContent="flex-end" gap={1}>
              <CancelButton
                show={dirty}
                handleCancel={() => void resetForm()}
              />
              <SaveButton disabled={isSubmitting || !dirty} />
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  )
}
