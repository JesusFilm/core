import { useMutation } from '@apollo/client'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { CancelButton } from '../../../../../../../../components/CancelButton'
import { SaveButton } from '../../../../../../../../components/SaveButton'
import { GetAdminVideo_AdminVideo_VideoImageAlts as VideoImageAlts } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useVideo } from '../../../../../../../../libs/VideoProvider'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

export const CREATE_VIDEO_IMAGE_ALT = graphql(`
  mutation CreateVideoImageAlt($input: VideoTranslationCreateInput!) {
    videoImageAltCreate(input: $input) {
      id
      value
    }
  }
`)

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
  const { enqueueSnackbar } = useSnackbar()
  const [createVideoImageAlt] = useMutation(CREATE_VIDEO_IMAGE_ALT)
  const [updateVideoImageAlt] = useMutation(UPDATE_VIDEO_IMAGE_ALT)

  const video = useVideo()

  const validationSchema = object().shape({
    imageAlt: string().trim().required(t('Image Alt is required'))
  })

  async function handleUpdateVideoImageAlt(
    values: FormikValues
  ): Promise<void> {
    if (videoImageAlts.length === 0) {
      const res = await createVideoImageAlt({
        variables: {
          input: {
            videoId: video.id,
            value: values.imageAlt,
            primary: true,
            languageId: DEFAULT_VIDEO_LANGUAGE_ID
          }
        }
      })

      if (res.data?.videoImageAltCreate == null) {
        enqueueSnackbar(t('Failed to create video image alt'), {
          variant: 'error'
        })
        return
      }
    } else {
      const res = await updateVideoImageAlt({
        variables: {
          input: {
            id: videoImageAlts[0].id,
            value: values.imageAlt
          }
        }
      })

      if (res.data?.videoImageAltUpdate == null) {
        enqueueSnackbar(t('Failed to update video image alt'), {
          variant: 'error'
        })
      }
    }
  }

  return (
    <Formik
      initialValues={{
        imageAlt: videoImageAlts?.[0]?.value ?? ''
      }}
      onSubmit={handleUpdateVideoImageAlt}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {({
        values,
        errors,
        handleChange,
        isValid,
        isSubmitting,
        dirty,
        resetForm
      }) => (
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
            <Divider sx={{ mx: -4 }} />
            <Stack direction="row" justifyContent="flex-end" gap={1}>
              <CancelButton show={dirty} handleCancel={() => resetForm()} />
              <SaveButton disabled={!isValid || isSubmitting || !dirty} />
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  )
}
