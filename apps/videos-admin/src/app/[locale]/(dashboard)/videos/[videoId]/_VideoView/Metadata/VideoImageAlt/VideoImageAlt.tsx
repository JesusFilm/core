import { useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { SaveButton } from '../../../../../../../../components/SaveButton'
import { GetAdminVideo_AdminVideo_VideoImageAlts as VideoImageAlts } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'

export const UPDATE_VIDEO_IMAGE_ALT = graphql(`
  mutation UpdateVideoImageAlt($input: VideoTranslationUpdateInput!) {
    videoImageAltUpdate(input: $input) {
      id
      value
    }
  }
`)

interface VideoImageAltProps {
  videoImageAlts: VideoImageAlts
}

export function VideoImageAlt({
  videoImageAlts
}: VideoImageAltProps): ReactElement {
  const t = useTranslations()
  const [updateVideoImageAlt] = useMutation(UPDATE_VIDEO_IMAGE_ALT)

  const validationSchema = object().shape({
    imageAlt: string().trim().required(t('Image Alt is required'))
  })

  async function handleUpdateVideoImageAlt(
    values: FormikValues
  ): Promise<void> {
    await updateVideoImageAlt({
      variables: {
        input: {
          id: videoImageAlts[0].id,
          value: values.imageAlt
        }
      }
    })
  }

  return (
    <Formik
      initialValues={{
        imageAlt: videoImageAlts?.[0].value
      }}
      onSubmit={handleUpdateVideoImageAlt}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {({ values, errors, handleChange, isValid, isSubmitting, dirty }) => (
        <Form>
          <Stack gap={2}>
            <Stack direction="row" gap={2}>
              <TextField
                id="imageAlt"
                name="imageAlt"
                label={t('Image Alt')}
                fullWidth
                value={values.imageAlt}
                variant="outlined"
                error={Boolean(errors.imageAlt)}
                onChange={handleChange}
                helperText={errors.imageAlt as string}
              />
            </Stack>
            <Stack direction="row" justifyContent="flex-end">
              <SaveButton disabled={!isValid || isSubmitting || !dirty} />
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  )
}
