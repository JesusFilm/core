'use client'
import { useMutation, useSuspenseQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikProps, FormikValues } from 'formik'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'
import { object, string } from 'yup'

import { graphql } from '@core/shared/gql'

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
  const [createdImageAltId, setCreatedImageAltId] = useState<string | null>(
    null
  )

  const [createVideoImageAlt] = useMutation(CREATE_VIDEO_IMAGE_ALT, {
    refetchQueries: [
      {
        query: GET_VIDEO_IMAGE_ALT,
        variables: {
          id: videoId,
          languageId: DEFAULT_VIDEO_LANGUAGE_ID
        }
      }
    ],
    update(cache, { data: mutationData }) {
      if (!mutationData?.videoImageAltCreate) return
      const existing = cache.readQuery({
        query: GET_VIDEO_IMAGE_ALT,
        variables: { id: videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
      })
      cache.writeQuery({
        query: GET_VIDEO_IMAGE_ALT,
        variables: { id: videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID },
        data: {
          adminVideo: {
            ...existing?.adminVideo,
            imageAlt: [mutationData.videoImageAltCreate]
          }
        }
      })
    }
  })
  const [updateVideoImageAlt] = useMutation(UPDATE_VIDEO_IMAGE_ALT, {
    refetchQueries: [
      {
        query: GET_VIDEO_IMAGE_ALT,
        variables: {
          id: videoId,
          languageId: DEFAULT_VIDEO_LANGUAGE_ID
        }
      }
    ]
  })

  const validationSchema = object().shape({
    imageAlt: string().trim().required('Image Alt is required')
  })

  const { data } = useSuspenseQuery(GET_VIDEO_IMAGE_ALT, {
    variables: {
      id: videoId,
      languageId: DEFAULT_VIDEO_LANGUAGE_ID
    }
  })
  const imageAlts = data.adminVideo.imageAlt
  // If the query data is in sync, clear the local createdImageAltId
  useEffect(() => {
    if (createdImageAltId && imageAlts.length > 0) {
      setCreatedImageAltId(null)
    }
  }, [createdImageAltId, imageAlts])

  async function handleUpdateVideoImageAlt(
    values: FormikValues,
    { resetForm }: FormikProps<FormikValues>
  ): Promise<void> {
    if (imageAlts.length === 0 && !createdImageAltId) {
      await createVideoImageAlt({
        variables: {
          input: {
            videoId: videoId,
            value: values.imageAlt,
            primary: true,
            languageId: DEFAULT_VIDEO_LANGUAGE_ID
          }
        },
        onCompleted: (mutationData) => {
          enqueueSnackbar('Video image alt created', {
            variant: 'success'
          })
          resetForm({ values })
          setCreatedImageAltId(mutationData?.videoImageAltCreate?.id ?? null)
        },
        onError: () => {
          enqueueSnackbar('Failed to create video image alt', {
            variant: 'error'
          })
        }
      })
    } else {
      const updateId = imageAlts[0]?.id || createdImageAltId
      if (!updateId) {
        enqueueSnackbar('No image alt ID available for update', {
          variant: 'error'
        })
        return
      }
      await updateVideoImageAlt({
        variables: {
          input: {
            id: updateId,
            value: values.imageAlt
          }
        },
        onCompleted: () => {
          enqueueSnackbar('Video image alt updated', {
            variant: 'success'
          })
          resetForm({ values })
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
