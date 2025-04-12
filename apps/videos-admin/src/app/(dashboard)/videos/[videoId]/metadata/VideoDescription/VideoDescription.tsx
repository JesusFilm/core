import { gql, useMutation } from '@apollo/client'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { Form, Formik, FormikValues } from 'formik'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import _unescape from 'lodash/unescape'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { CancelButton } from '../../../../../../components/CancelButton'
import { ResizableTextField } from '../../../../../../components/ResizableTextField'
import { SaveButton } from '../../../../../../components/SaveButton'
import { GetAdminVideo_AdminVideo_VideoDescriptions as VideoDescriptions } from '../../../../../../libs/useAdminVideo/useAdminVideo'
import { useVideo } from '../../../../../../libs/VideoProvider'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../_VideoView/constants'

export const CREATE_VIDEO_DESCRIPTION = graphql(`
  mutation CreateVideoDescription($input: VideoTranslationCreateInput!) {
    videoDescriptionCreate(input: $input) {
      id
      value
    }
  }
`)

export type CreateVideoDescription = ResultOf<typeof CREATE_VIDEO_DESCRIPTION>
export type CreateVideoDescriptionVariables = VariablesOf<
  typeof CREATE_VIDEO_DESCRIPTION
>

export const UPDATE_VIDEO_DESCRIPTION = graphql(`
  mutation UpdateVideoDescription($input: VideoTranslationUpdateInput!) {
    videoDescriptionUpdate(input: $input) {
      id
      value
    }
  }
`)

interface VideoDescriptionProps {
  videoDescriptions: VideoDescriptions
}

export function VideoDescription({
  videoDescriptions
}: VideoDescriptionProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const video = useVideo()
  const [createVideoDescription] = useMutation(CREATE_VIDEO_DESCRIPTION, {
    update(cache, { data }) {
      if (!data?.videoDescriptionCreate) return

      cache.modify({
        id: cache.identify(video),
        fields: {
          description(existingDescriptions = []) {
            const newDescriptionRef = cache.writeFragment({
              data: data.videoDescriptionCreate,
              fragment: gql`
                fragment NewDescription on VideoDescription {
                  id
                  value
                }
              `
            })
            return [...existingDescriptions, newDescriptionRef]
          }
        }
      })
    }
  })
  const [updateVideoDescription] = useMutation(UPDATE_VIDEO_DESCRIPTION)

  const validationSchema = object().shape({
    description: string().required('Description is required')
  })

  async function handleUpdateVideoDescription(
    values: FormikValues
  ): Promise<void> {
    if (videoDescriptions.length === 0) {
      await createVideoDescription({
        variables: {
          input: {
            videoId: video.id,
            value: values.description,
            primary: true,
            languageId: DEFAULT_VIDEO_LANGUAGE_ID
          }
        },
        onCompleted: () => {
          enqueueSnackbar('Video description created', {
            variant: 'success'
          })
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
            <ResizableTextField
              name="description"
              aria-label="description"
              value={values.description}
              onChange={handleChange}
              error={Boolean(errors.description)}
              helperText={errors.description as string}
              minRows={6}
              maxRows={6}
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
