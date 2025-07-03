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
      restrictDownloadPlatforms
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
          id: videoId,
          restrictDownloadPlatforms: values.restrictDownloadPlatforms
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
        restrictDownloadPlatforms:
          data.adminVideo.restrictDownloadPlatforms || []
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
              <FormControl component="fieldset" variant="standard">
                <FormGroup>
                  {platformOptions.map((platform) => (
                    <FormControlLabel
                      key={platform.value}
                      control={
                        <Checkbox
                          checked={values.restrictDownloadPlatforms.includes(
                            platform.value
                          )}
                          onChange={(event) => {
                            const currentPlatforms =
                              values.restrictDownloadPlatforms
                            if (event.target.checked) {
                              void setFieldValue('restrictDownloadPlatforms', [
                                ...currentPlatforms,
                                platform.value
                              ])
                            } else {
                              void setFieldValue(
                                'restrictDownloadPlatforms',
                                currentPlatforms.filter(
                                  (p) => p !== platform.value
                                )
                              )
                            }
                          }}
                          name={`restrictDownloadPlatforms.${platform.value}`}
                        />
                      }
                      label={platform.label}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Stack>
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
