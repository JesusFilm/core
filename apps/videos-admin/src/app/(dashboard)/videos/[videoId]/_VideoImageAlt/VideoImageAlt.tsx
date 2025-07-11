'use client'
import { useMutation, useSuspenseQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikProps, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { CancelButton } from '../../../../../components/CancelButton'
import { SaveButton } from '../../../../../components/SaveButton'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

export const GET_VIDEO_IMAGE_ALT = graphql(`
  query GetVideoImageAlt($id: ID!, $languageId: ID!) {
    adminVideo(id: $id) {
      id
      imageAlt(languageId: $languageId) {
        id
        value
      }
    }
  }
`)

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
  videoId: string
}

export function VideoImageAlt({ videoId }: VideoImageAltProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()

  const [createVideoImageAlt] = useMutation(CREATE_VIDEO_IMAGE_ALT)
  const [updateVideoImageAlt] = useMutation(UPDATE_VIDEO_IMAGE_ALT)

  const validationSchema = object().shape({
    imageAlt: string().trim().required('Image Alt is required')
  })

  const { data } = useSuspenseQuery(GET_VIDEO_IMAGE_ALT, {
    variables: {
      id: videoId,
      languageId: DEFAULT_VIDEO_LANGUAGE_ID
    }
  })

  async function handleUpdateVideoImageAlt(
    values: FormikValues,
    { resetForm }: FormikProps<FormikValues>
  ): Promise<void> {
    if (data.adminVideo.imageAlt.length === 0) {
      await createVideoImageAlt({
        variables: {
          input: {
            videoId: videoId,
            value: values.imageAlt,
            primary: true,
            languageId: DEFAULT_VIDEO_LANGUAGE_ID
          }
        },
        onCompleted: () => {
          enqueueSnackbar('Video image alt created', {
            variant: 'success'
          })
          resetForm({ values })
        },
        onError: () => {
          enqueueSnackbar('Failed to create video image alt', {
            variant: 'error'
          })
        }
      })
    } else {
      await updateVideoImageAlt({
        variables: {
          input: {
            id: data.adminVideo.imageAlt[0].id,
            value: values.imageAlt
          }
        },
        onCompleted: () => {
          enqueueSnackbar('Video image alt updated', {
            variant: 'success'
          })
        },
        onError: () => {
          enqueueSnackbar('Failed to update video image alt', {
            variant: 'error'
          })
        }
      })
    }
  }

  return (
    <Formik
      initialValues={{
        imageAlt: data.adminVideo.imageAlt[0]?.value ?? ''
      }}
      onSubmit={handleUpdateVideoImageAlt}
      validationSchema={validationSchema}
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
                label="Image Accessibility Text"
                fullWidth
                value={values.imageAlt}
                variant="outlined"
                error={Boolean(errors.imageAlt)}
                onChange={handleChange}
                helperText={errors.imageAlt as string}
                spellCheck={true}
                placeholder="Please enter a short image description, up to 160 characters."
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
