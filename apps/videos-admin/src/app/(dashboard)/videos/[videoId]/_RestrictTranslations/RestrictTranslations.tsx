'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikProps, FormikValues } from 'formik'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { graphql } from '@core/shared/gql'

import { CancelButton } from '../../../../../components/CancelButton'
import { SaveButton } from '../../../../../components/SaveButton'

interface RestrictTranslationsProps {
  videoId: string
}

export const GET_RESTRICT_TRANSLATIONS = graphql(`
  query GetRestrictTranslations($id: ID!) {
    adminVideo(id: $id) {
      id
      restrictTranslations
    }
  }
`)

export const UPDATE_RESTRICT_TRANSLATIONS = graphql(`
  mutation UpdateRestrictTranslations($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
      restrictTranslations
    }
  }
`)

export function RestrictTranslations({
  videoId
}: RestrictTranslationsProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [updateRestrictTranslations] = useMutation(UPDATE_RESTRICT_TRANSLATIONS)

  const { data } = useSuspenseQuery(GET_RESTRICT_TRANSLATIONS, {
    variables: { id: videoId }
  })
  const restrictionLocked = data.adminVideo.restrictTranslations === true

  async function handleUpdateRestrictTranslations(
    values: FormikValues,
    { resetForm }: FormikProps<FormikValues>
  ): Promise<void> {
    await updateRestrictTranslations({
      variables: {
        input: {
          id: videoId,
          restrictTranslations: values.restrictTranslations
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Successfully updated translation restriction', {
          variant: 'success'
        })
        void resetForm({ values })
      },
      onError: () => {
        enqueueSnackbar('Failed to update translation restriction', {
          variant: 'error'
        })
      }
    })
  }

  return (
    <Formik
      initialValues={{
        restrictTranslations: data.adminVideo.restrictTranslations ?? false
      }}
      onSubmit={handleUpdateRestrictTranslations}
    >
      {({ values, setFieldValue, isSubmitting, dirty, resetForm }) => (
        <Form>
          <Stack gap={2}>
            <Stack gap={1}>
              <Typography variant="body2" color="text.secondary">
                When enabled, generated translated audio variants or generated
                subtitle tracks should not be created for this video. Metadata
                translations (title, description, study questions) are
                unaffected. Once enabled, this restriction cannot be disabled.
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={values.restrictTranslations}
                    onChange={(event) => {
                      void setFieldValue(
                        'restrictTranslations',
                        event.target.checked
                      )
                    }}
                    name="restrictTranslations"
                    disabled={restrictionLocked}
                  />
                }
                label="Restrict translations"
              />
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
