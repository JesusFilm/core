import { useMutation, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Form, Formik } from 'formik'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { usePathname, useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, useMemo } from 'react'
import { InferType, mixed, object, string } from 'yup'

import { FormSelectField } from '../../../../../components/FormSelectField'
import { FormTextField } from '../../../../../components/FormTextField'
import { videoLabels } from '../../../../../constants'
import { useCreateEditionMutation } from '../../../../../libs/useCreateEdition'

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
    }
  }
`)

export type CreateVideoVariables = VariablesOf<typeof CREATE_VIDEO>
export type CreateVideo = ResultOf<typeof CREATE_VIDEO>

interface VideoCreateFormProps {
  close: () => void
  parentId?: string
  onCreateSuccess?: (videoId: string) => void
}

export function VideoCreateForm({
  close,
  parentId,
  onCreateSuccess
}: VideoCreateFormProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const validationSchema = object().shape({
    id: string().trim().required('ID is required'),
    slug: string().trim().required('Slug is required'),
    label: mixed<VideoLabel>()
      .oneOf(Object.values(VideoLabel))
      .required('Label is required')
  })

  const router = useRouter()
  const pathname = usePathname()

  const { data: parentData } = useQuery(GET_PARENT_VIDEO_LABEL, {
    variables: { videoId: parentId || '' },
    skip: !parentId
  })

  const [createVideo] = useMutation(CREATE_VIDEO)
  const [createEdition] = useCreateEditionMutation()

  // Determine the suggested child label based on parent label
  const suggestedLabel = useMemo(() => {
    if (!parentId || !parentData?.adminVideo?.label) return undefined

    const parentLabel = parentData.adminVideo.label

    switch (parentLabel) {
      case 'collection':
        return VideoLabel.episode
      case 'featureFilm':
        return VideoLabel.segment
      case 'series':
        return VideoLabel.episode
      default:
        return undefined
    }
  }, [parentId, parentData])

  const handleSubmit = async (values: InferType<typeof validationSchema>) => {
    await createVideo({
      variables: {
        input: {
          id: values.id,
          slug: values.slug,
          label: values.label,
          primaryLanguageId: '529',
          noIndex: false,
          published: false,
          childIds: []
        }
      },
      onCompleted: async (data) => {
        const videoId = data.videoCreate.id

        await createEdition({
          variables: {
            input: {
              videoId,
              name: 'base'
            }
          },
          onCompleted: () => {
            enqueueSnackbar('Successfully created video.', {
              variant: 'success'
            })

            if (onCreateSuccess != null) {
              onCreateSuccess(videoId)
            } else {
              close()
              router.push(`${pathname}/${values.id}`)
            }
          },
          onError: () => {
            enqueueSnackbar('Failed to create video edition.', {
              variant: 'error'
            })
          }
        })
      },
      onError: () => {
        // TODO: proper error handling for specific errors
        enqueueSnackbar('Something went wrong.', { variant: 'error' })
      }
    })
  }

  const initialValues: InferType<typeof validationSchema> = {
    id: '',
    slug: '',
    label: suggestedLabel || ('' as VideoLabel)
  }

  // Get explanatory text for the suggested label
  const getSuggestedLabelExplanation = (): string => {
    if (!suggestedLabel) return ''

    const parentLabel = parentData?.adminVideo?.label
    const suggestedLabelName = videoLabels.find(
      (vl) => vl.value === suggestedLabel
    )?.label
    const parentLabelName = videoLabels.find(
      (vl) => vl.value === parentLabel
    )?.label

    return `Based on the parent ${parentLabelName}, we've suggested ${suggestedLabelName}`
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
          <FormTextField name="id" label="ID" fullWidth />
          <FormTextField name="slug" label="Slug" fullWidth />
          <FormSelectField
            name="label"
            label="Label"
            options={videoLabels}
            fullWidth
          />
          {suggestedLabel && (
            <Typography variant="caption" color="text.secondary">
              {getSuggestedLabelExplanation()}
            </Typography>
          )}
          {parentId && (
            <Typography variant="caption" color="text.secondary">
              This video will be added as a child to video with ID: {parentId}
            </Typography>
          )}
          <Stack direction="row" sx={{ gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={close} fullWidth>
              <Typography>Cancel</Typography>
            </Button>
            <Button variant="contained" type="submit" fullWidth>
              <Typography>Create</Typography>
            </Button>
          </Stack>
        </Stack>
      </Form>
    </Formik>
  )
}
