'use client'

import { useMutation, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Form, Formik } from 'formik'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, useMemo, useState } from 'react'
import { InferType, mixed, object, string } from 'yup'

import { FormSelectField } from '../../../../components/FormSelectField'
import { FormTextField } from '../../../../components/FormTextField'
import { videoLabels } from '../../../../constants'

enum VideoLabel {
  behindTheScenes = 'behindTheScenes',
  collection = 'collection',
  episode = 'episode',
  featureFilm = 'featureFilm',
  segment = 'segment',
  series = 'series',
  shortFilm = 'shortFilm',
  trailer = 'trailer'
}

export const CREATE_VIDEO = graphql(`
  mutation CreateVideo($input: VideoCreateInput!) {
    videoCreate(input: $input) {
      id
    }
  }
`)

export const GET_PARENT_VIDEO_LABEL = graphql(`
  query GetParentVideoLabel($videoId: ID!) {
    adminVideo(id: $videoId) {
      id
      label
      origin {
        id
      }
    }
  }
`)

export const GET_VIDEO_ORIGINS = graphql(`
  query GetVideoOrigins {
    videoOrigins {
      id
      name
      description
    }
  }
`)

export const CREATE_EDITION = graphql(`
  mutation CreateEdition($input: VideoEditionCreateInput!) {
    videoEditionCreate(input: $input) {
      id
    }
  }
`)

export const CREATE_VIDEO_VARIANT = graphql(`
  mutation CreateVideoVariant($input: VideoVariantCreateInput!) {
    videoVariantCreate(input: $input) {
      id
      language {
        id
      }
      slug
    }
  }
`)

export type CreateVideoVariables = VariablesOf<typeof CREATE_VIDEO>
export type CreateVideo = ResultOf<typeof CREATE_VIDEO>

interface VideoCreateFormProps {
  parentId?: string
  onCreateSuccess?: (videoId: string) => void
}

export function VideoCreateForm({
  parentId,
  onCreateSuccess
}: VideoCreateFormProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validationSchema = object().shape({
    id: string().trim().required('ID is required'),
    slug: string().trim().required('Slug is required'),
    label: mixed<VideoLabel>()
      .oneOf(Object.values(VideoLabel))
      .required('Label is required'),
    originId: string().trim().required('Origin is required')
  })

  const router = useRouter()

  const { data: parentData } = useQuery(GET_PARENT_VIDEO_LABEL, {
    variables: { videoId: parentId || '' },
    skip: !parentId
  })

  const { data: originsData, loading: originsLoading } =
    useQuery(GET_VIDEO_ORIGINS)

  const [createVideo] = useMutation(CREATE_VIDEO)
  const [createEdition] = useMutation(CREATE_EDITION)
  const [createVideoVariant] = useMutation(CREATE_VIDEO_VARIANT)

  // Determine valid child labels and suggested label based on parent label
  const { validChildLabels, suggestedLabel } = useMemo(() => {
    if (!parentId || !parentData?.adminVideo?.label) {
      return { validChildLabels: videoLabels, suggestedLabel: undefined }
    }

    const parentLabel = parentData.adminVideo.label

    switch (parentLabel) {
      case 'collection':
        return {
          validChildLabels: videoLabels.filter((vl) =>
            ['episode', 'featureFilm', 'shortFilm', 'series'].includes(vl.value)
          ),
          suggestedLabel: VideoLabel.episode
        }
      case 'featureFilm':
        return {
          validChildLabels: videoLabels.filter((vl) =>
            ['segment', 'trailer', 'behindTheScenes'].includes(vl.value)
          ),
          suggestedLabel: VideoLabel.segment
        }
      case 'series':
        return {
          validChildLabels: videoLabels.filter((vl) =>
            ['episode', 'trailer', 'behindTheScenes'].includes(vl.value)
          ),
          suggestedLabel: VideoLabel.episode
        }
      case 'episode':
        return {
          validChildLabels: videoLabels.filter((vl) =>
            ['segment', 'trailer', 'behindTheScenes'].includes(vl.value)
          ),
          suggestedLabel: VideoLabel.segment
        }
      default:
        return { validChildLabels: videoLabels, suggestedLabel: undefined }
    }
  }, [parentId, parentData])

  // Format origins for dropdown
  const originOptions = useMemo(() => {
    if (!originsData?.videoOrigins) return []

    return originsData.videoOrigins.map((origin) => ({
      value: origin.id,
      label: `${origin.id} - ${origin.name}`
    }))
  }, [originsData])

  const handleSubmit = async (values: InferType<typeof validationSchema>) => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      await createVideo({
        variables: {
          input: {
            id: values.id,
            slug: values.slug,
            label: values.label,
            originId: values.originId,
            primaryLanguageId: '529',
            noIndex: false,
            published: false,
            childIds: []
          }
        },
        update: (cache, { data }) => {
          if (!data?.videoCreate) return

          // Invalidate all adminVideos and adminVideosCount queries in the cache
          // This ensures that any active queries will refetch and show the new video
          cache.evict({ fieldName: 'adminVideos' })
          cache.evict({ fieldName: 'adminVideosCount' })
          cache.gc()
        },
        onCompleted: async (data) => {
          const videoId = data.videoCreate.id

          try {
            await createEdition({
              variables: {
                input: {
                  videoId,
                  name: 'base'
                }
              }
            })

            // Create null video variant for series and collections with language 529 (English)
            // Currently required for the video to be visible in the frontend
            if (values.label === 'series' || values.label === 'collection') {
              try {
                const variantId = `529_${videoId}`
                const slug = `${values.slug}/english`

                await createVideoVariant({
                  variables: {
                    input: {
                      id: variantId,
                      videoId,
                      edition: 'base',
                      languageId: '529',
                      slug,
                      downloadable: false,
                      published: false
                    }
                  }
                })
              } catch (variantError) {
                console.warn(
                  'Failed to create null video varian for collection or series:',
                  variantError
                )
              }
            }

            enqueueSnackbar('Successfully created video.', {
              variant: 'success'
            })

            if (onCreateSuccess != null) {
              await onCreateSuccess(videoId)
            } else {
              router.push(`/videos/${videoId}`)
            }
          } catch (error) {
            enqueueSnackbar('Failed to create video edition.', {
              variant: 'error'
            })
          } finally {
            setIsSubmitting(false)
          }
        },
        onError: () => {
          // TODO: proper error handling for specific errors
          enqueueSnackbar('Something went wrong.', { variant: 'error' })
          setIsSubmitting(false)
        }
      })
    } catch (error) {
      enqueueSnackbar('Something went wrong.', { variant: 'error' })
      setIsSubmitting(false)
    }
  }

  const initialValues: InferType<typeof validationSchema> = {
    id: '',
    slug: '',
    label: suggestedLabel || ('' as VideoLabel),
    originId: parentData?.adminVideo?.origin?.id || ''
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize={true}
    >
      <Form data-testid="VideoCreateForm">
        <Stack gap={2}>
          <FormSelectField
            name="originId"
            label="Origin"
            options={originOptions}
            fullWidth
            disabled={originsLoading}
          />
          <FormTextField
            name="id"
            label="ID"
            placeholder="eg. 1_jf_0_0"
            fullWidth
          />
          <FormTextField
            name="slug"
            label="Slug"
            placeholder="eg. jesus-walks-on-water"
            fullWidth
          />
          <FormSelectField
            name="label"
            label="Label"
            options={validChildLabels}
            fullWidth
          />
          {parentId && (
            <Typography variant="caption" color="text.secondary"></Typography>
          )}
          {parentId && (
            <Typography variant="caption" color="text.secondary">
              This video will be added as a child to video with ID: {parentId}
            </Typography>
          )}
          <Stack direction="row" sx={{ gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() =>
                router.push(parentId ? `/videos/${parentId}` : `/videos`)
              }
              fullWidth
            >
              <Typography>Cancel</Typography>
            </Button>
            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{
                opacity: isSubmitting ? 0.7 : 1,
                pointerEvents: isSubmitting ? 'none' : 'auto'
              }}
            >
              <Typography>{isSubmitting ? 'Creating...' : 'Create'}</Typography>
            </Button>
          </Stack>
        </Stack>
      </Form>
    </Formik>
  )
}
