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

interface RestrictAutoTranslationsProps {
  videoId: string
}

export const GET_RESTRICT_AUTO_TRANSLATIONS = graphql(`
  query GetRestrictAutoTranslations($id: ID!) {
    adminVideo(id: $id) {
      id
      restrictAutoTranslations
    }
  }
`)

export const UPDATE_RESTRICT_AUTO_TRANSLATIONS = graphql(`
  mutation UpdateRestrictAutoTranslations($input: VideoUpdateInput!) {
    videoUpdate(input: $input) {
      id
      restrictAutoTranslations
    }
  }
`)

export function RestrictAutoTranslations({
  videoId
}: RestrictAutoTranslationsProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [updateRestrictAutoTranslations] = useMutation(
    UPDATE_RESTRICT_AUTO_TRANSLATIONS
  )

  const { data } = useSuspenseQuery(GET_RESTRICT_AUTO_TRANSLATIONS, {
    variables: { id: videoId }
  })
  const restrictionLocked = data.adminVideo.restrictAutoTranslations === true

  async function handleUpdateRestrictAutoTranslations(
    values: FormikValues,
    { resetForm }: FormikProps<FormikValues>
  ): Promise<void> {
    await updateRestrictAutoTranslations({
      variables: {
        input: {
          id: videoId,
          restrictAutoTranslations: values.restrictAutoTranslations
        }
      },
      onCompleted: () => {
        enqueueSnackbar(
          'Successfully updated automatic translation restriction',
          {
            variant: 'success'
          }
        )
        void resetForm({ values })
      },
      onError: () => {
        enqueueSnackbar('Failed to update automatic translation restriction', {
          variant: 'error'
        })
      }
    })
  }

  return (
    <Formik
      initialValues={{
        restrictAutoTranslations:
          data.adminVideo.restrictAutoTranslations ?? false
      }}
      onSubmit={handleUpdateRestrictAutoTranslations}
    >
      {({ values, setFieldValue, isSubmitting, dirty, resetForm }) => (
        <Form>
          <Stack gap={2}>
            <Stack gap={1}>
              <Typography variant="body2" color="text.secondary">
                When enabled, automated systems must not add translated audio
                variants or subtitle tracks to this video without express
                permission. Metadata translations (title, description, study
                questions) are unaffected. Once enabled, this restriction cannot
                be disabled.
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={values.restrictAutoTranslations}
                    onChange={(event) => {
                      void setFieldValue(
                        'restrictAutoTranslations',
                        event.target.checked
                      )
                    }}
                    name="restrictAutoTranslations"
                    disabled={restrictionLocked}
                  />
                }
                label="Restrict automatic translations"
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
