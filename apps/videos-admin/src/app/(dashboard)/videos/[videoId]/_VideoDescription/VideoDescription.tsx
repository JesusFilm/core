'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { Form, Formik, FormikProps, FormikValues } from 'formik'
import _unescape from 'lodash/unescape'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { graphql } from '@core/shared/gql'

import { CancelButton } from '../../../../../components/CancelButton'
import { ResizableTextField } from '../../../../../components/ResizableTextField'
import { SaveButton } from '../../../../../components/SaveButton'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

export const CREATE_VIDEO_DESCRIPTION = graphql(`
  mutation CreateVideoDescription($input: VideoTranslationCreateInput!) {
    videoDescriptionCreate(input: $input) {
      id
      value
    }
  }
`)

export const GET_VIDEO_DESCRIPTION = graphql(`
  query GetVideoDescription($videoId: ID!, $languageId: ID!) {
    adminVideo(id: $videoId) {
      description(languageId: $languageId) {
        id
        value
      }
    }
  }
`)

export const UPDATE_VIDEO_DESCRIPTION = graphql(`
  mutation UpdateVideoDescription($input: VideoTranslationUpdateInput!) {
    videoDescriptionUpdate(input: $input) {
      id
      value
    }
  }
`)

interface VideoDescriptionProps {
  videoId: string
}

export function VideoDescription({
  videoId
}: VideoDescriptionProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [createVideoDescription] = useMutation(CREATE_VIDEO_DESCRIPTION, {
    refetchQueries: [
      {
        query: GET_VIDEO_DESCRIPTION,
        variables: { videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
      }
    ]
  })
  const [updateVideoDescription] = useMutation(UPDATE_VIDEO_DESCRIPTION, {
    refetchQueries: [
      {
        query: GET_VIDEO_DESCRIPTION,
        variables: { videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
      }
    ]
  })

  const validationSchema = object().shape({
    description: string().required('Description is required')
  })

  const { data } = useSuspenseQuery(GET_VIDEO_DESCRIPTION, {
    variables: { videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })

  const videoDescriptions = data?.adminVideo.description

  async function handleUpdateVideoDescription(
    values: FormikValues,
    { resetForm }: FormikProps<FormikValues>
  ): Promise<void> {
    if (videoDescriptions.length === 0) {
      await createVideoDescription({
        variables: {
          input: {
            videoId: videoId,
            value: values.description,
            primary: true,
            languageId: DEFAULT_VIDEO_LANGUAGE_ID
          }
        },
        onCompleted: () => {
          enqueueSnackbar('Video description created', {
            variant: 'success'
          })
          resetForm({ values })
        },
        onError: () => {
          enqueueSnackbar('Failed to create video description', {
            variant: 'error'
          })
        }
      })
    } else {
      await updateVideoDescription({
        variables: {
          input: {
            id: videoDescriptions[0].id,
            value: values.description
          }
        },
        onCompleted: () => {
          enqueueSnackbar('Video description updated', {
            variant: 'success'
          })
          resetForm({ values })
        },
        onError: () => {
          enqueueSnackbar('Failed to update video description', {
            variant: 'error'
          })
        }
      })
    }
  }
  const description = _unescape(videoDescriptions?.[0]?.value ?? '').replace(
    /&#13;/g,
    '\n'
  )

  return (
    <Formik
      initialValues={{
        description
      }}
      onSubmit={handleUpdateVideoDescription}
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
            <ResizableTextField
              name="description"
              aria-label="description"
              value={values.description}
              onChange={handleChange}
              error={Boolean(errors.description)}
              helperText={errors.description as string}
              minRows={6}
              maxRows={6}
              spellCheck={true}
              placeholder="Please enter a description, up to 5000 characters."
            />
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
