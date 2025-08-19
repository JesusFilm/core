'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikProps, FormikValues } from 'formik'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { graphql } from '@core/shared/gql'

import { CancelButton } from '../../../../../components/CancelButton'
import { SaveButton } from '../../../../../components/SaveButton'

interface RestrictedViewsProps {
  videoId: string
}

export const GET_RESTRICTED_VIEWS = graphql(`
  query GetRestrictedViews($id: ID!) {
    adminVideo(id: $id) {
      id
      restrictViewPlatforms
    }
  }
`)

export const UPDATE_RESTRICTED_VIEWS = graphql(`
  mutation UpdateRestrictedViews($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
    }
  }
`)

const platformOptions = [
  { value: 'arclight', label: 'Arclight' },
  { value: 'journeys', label: 'Journeys' },
  { value: 'watch', label: 'Watch' }
] as const

export function RestrictedViews({
  videoId
}: RestrictedViewsProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [updateRestrictedViews] = useMutation(UPDATE_RESTRICTED_VIEWS)

  const { data } = useSuspenseQuery(GET_RESTRICTED_VIEWS, {
    variables: { id: videoId }
  })

  async function handleUpdateRestrictedViews(
    values: FormikValues,
    { resetForm }: FormikProps<FormikValues>
  ): Promise<void> {
    await updateRestrictedViews({
      variables: {
        input: {
          id: videoId,
          restrictViewPlatforms: values.restrictViewPlatforms
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Successfully updated restricted views', {
          variant: 'success'
        })
        void resetForm({ values })
      },
      onError: () => {
        enqueueSnackbar('Failed to update restricted views', {
          variant: 'error'
        })
      }
    })
  }

  return (
    <Formik
      initialValues={{
        restrictViewPlatforms: data.adminVideo.restrictViewPlatforms || []
      }}
      onSubmit={handleUpdateRestrictedViews}
    >
      {({ values, setFieldValue, isSubmitting, dirty, resetForm }) => (
        <Form>
          <Stack gap={2}>
            <Stack gap={1}>
              <Typography variant="body2" color="text.secondary">
                Select platforms where viewing should be blocked for this video.
                When a platform is selected, users accessing from that platform
                will not be able to view this video.
              </Typography>
              <FormControl component="fieldset" variant="standard">
                <FormGroup>
                  {platformOptions.map((platform) => (
                    <FormControlLabel
                      key={platform.value}
                      control={
                        <Checkbox
                          checked={values.restrictViewPlatforms.includes(
                            platform.value
                          )}
                          onChange={(event) => {
                            const currentPlatforms =
                              values.restrictViewPlatforms
                            if (event.target.checked) {
                              void setFieldValue('restrictViewPlatforms', [
                                ...currentPlatforms,
                                platform.value
                              ])
                            } else {
                              void setFieldValue(
                                'restrictViewPlatforms',
                                currentPlatforms.filter(
                                  (p) => p !== platform.value
                                )
                              )
                            }
                          }}
                          name={`restrictViewPlatforms.${platform.value}`}
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
