import { useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { SaveButton } from '../../../../../../../../components/SaveButton'
import { useAdminVideo } from '../../../../../../../../libs/useAdminVideo'
import { useEdit } from '../../../_EditProvider'

export const UPDATE_VIDEO_IMAGE_ALT = graphql(`
  mutation UpdateVideoImageAlt($input: VideoTranslationUpdateInput!) {
    videoImageAltUpdate(input: $input) {
      id
      value
    }
  }
`)

export function VideoImageAlt(): ReactElement {
  const t = useTranslations()
  const {
    state: { isEdit }
  } = useEdit()
  const [updateVideoImageAlt] = useMutation(UPDATE_VIDEO_IMAGE_ALT)
  const params = useParams<{ videoId: string; locale: string }>()
  const { data } = useAdminVideo({
    variables: { videoId: params?.videoId as string }
  })
  const video = data?.adminVideo

  const validationSchema = object().shape({
    imageAlt: string().trim().required(t('Image Alt is required'))
  })

  async function handleUpdateVideoImageAlt(
    values: FormikValues
  ): Promise<void> {
    if (video == null) return
    await updateVideoImageAlt({
      variables: {
        input: {
          id: video.imageAlt[0].id,
          value: values.imageAlt
        }
      }
    })
  }

  return (
    <Formik
      initialValues={{
        imageAlt: video?.imageAlt?.[0].value
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
                disabled={!isEdit}
              />
            </Stack>
            {isEdit && (
              <Stack direction="row" justifyContent="flex-end">
                <SaveButton disabled={!isValid || isSubmitting || !dirty} />
              </Stack>
            )}
          </Stack>
        </Form>
      )}
    </Formik>
  )
}
