'use client'
import { useMutation, useSuspenseQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { Form, Formik, FormikProps, FormikValues } from 'formik'
import _unescape from 'lodash/unescape'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'
import { object, string } from 'yup'

import { graphql } from '@core/shared/gql'

import { CancelButton } from '../../../../../components/CancelButton'
import { ResizableTextField } from '../../../../../components/ResizableTextField'
import { SaveButton } from '../../../../../components/SaveButton'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

export const GET_VIDEO_SNIPPET = graphql(`
  query GetVideoSnippet($videoId: ID!, $languageId: ID!) {
    adminVideo(id: $videoId) {
      id
      snippet(languageId: $languageId) {
        id
        value
      }
    }
  }
`)

export const CREATE_VIDEO_SNIPPET = graphql(`
  mutation CreateVideoSnippet($input: VideoTranslationCreateInput!) {
    videoSnippetCreate(input: $input) {
      id
      value
    }
  }
`)

export const UPDATE_VIDEO_SNIPPET = graphql(`
  mutation UpdateVideoSnippet($input: VideoTranslationUpdateInput!) {
    videoSnippetUpdate(input: $input) {
      id
      value
    }
  }
`)

interface VideoSnippetProps {
  videoId: string
}

export function VideoSnippet({ videoId }: VideoSnippetProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [createdSnippetId, setCreatedSnippetId] = useState<string | null>(null)
  const [createVideoSnippet] = useMutation(CREATE_VIDEO_SNIPPET, {
    refetchQueries: [
      {
        query: GET_VIDEO_SNIPPET,
        variables: { videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
      }
    ],
    update(cache, { data: mutationData }) {
      if (!mutationData?.videoSnippetCreate) return
      const existing = cache.readQuery({
        query: GET_VIDEO_SNIPPET,
        variables: { videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
      })
      cache.writeQuery({
        query: GET_VIDEO_SNIPPET,
        variables: { videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID },
        data: {
          adminVideo: {
            ...existing?.adminVideo,
            snippet: [mutationData.videoSnippetCreate]
          }
        }
      })
    }
  })
  const [updateVideoSnippet] = useMutation(UPDATE_VIDEO_SNIPPET, {
    refetchQueries: [
      {
        query: GET_VIDEO_SNIPPET,
        variables: { videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
      }
    ]
  })

  const validationSchema = object().shape({
    snippet: string().required('Snippet is required')
  })

  const { data } = useSuspenseQuery(GET_VIDEO_SNIPPET, {
    variables: { videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })
  const snippets = data?.adminVideo.snippet
  // If the query data is in sync, clear the local createdSnippetId
  useEffect(() => {
    if (createdSnippetId && snippets.length > 0) {
      setCreatedSnippetId(null)
    }
  }, [createdSnippetId, snippets])

  async function handleUpdateVideoSnippet(
    values: FormikValues,
    { resetForm }: FormikProps<FormikValues>
  ): Promise<void> {
    if (snippets.length === 0 && !createdSnippetId) {
      await createVideoSnippet({
        variables: {
          input: {
            videoId: videoId,
            value: values.snippet,
            primary: true,
            languageId: DEFAULT_VIDEO_LANGUAGE_ID
          }
        },
        onCompleted: (mutationData) => {
          enqueueSnackbar('Video short description created', {
            variant: 'success'
          })
          resetForm({ values })
          setCreatedSnippetId(mutationData?.videoSnippetCreate?.id ?? null)
        },
        onError: () => {
          enqueueSnackbar('Failed to create video short description', {
            variant: 'error'
          })
        }
      })
    } else {
      const updateId = snippets[0]?.id || createdSnippetId
      if (!updateId) {
        enqueueSnackbar('No snippet ID available for update', {
          variant: 'error'
        })
        return
      }
      await updateVideoSnippet({
        variables: {
          input: {
            id: updateId,
            value: values.snippet
          }
        },
        onCompleted: () => {
          enqueueSnackbar('Video short description updated', {
            variant: 'success'
          })
          resetForm({ values })
        },
        onError: () => {
          enqueueSnackbar('Failed to update video short description', {
            variant: 'error'
          })
        }
      })
    }
  }

  const snippet = _unescape(data?.adminVideo.snippet[0]?.value ?? '').replace(
    /&#13;/g,
    '\n'
  )

  return (
    <Formik
      initialValues={{
        snippet
      }}
      onSubmit={handleUpdateVideoSnippet}
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
              name="snippet"
              aria-label="snippet"
              value={values.snippet}
              onChange={handleChange}
              error={Boolean(errors.snippet)}
              helperText={errors.snippet as string}
              minRows={6}
              maxRows={6}
              spellCheck={true}
              placeholder="Please enter a short description, up to 160 characters."
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
