import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Form, Formik } from 'formik'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { usePathname, useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { InferType, mixed, object, string } from 'yup'

import { FormLanguageSelect } from '../../../../../components/FormLanguageSelect'
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

export type CreateVideoVariables = VariablesOf<typeof CREATE_VIDEO>
export type CreateVideo = ResultOf<typeof CREATE_VIDEO>

interface VideoCreateFormProps {
  close: () => void
}

export function VideoCreateForm({ close }: VideoCreateFormProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const validationSchema = object().shape({
    id: string().trim().required('ID is required'),
    slug: string().trim().required('Slug is required'),
    primaryLanguageId: string().required('Primary language is required'),
    label: mixed<VideoLabel>()
      .oneOf(Object.values(VideoLabel))
      .required('Label is required')
  })

  const router = useRouter()
  const pathname = usePathname()

  const [createVideo] = useMutation(CREATE_VIDEO)
  const [createEdition] = useCreateEditionMutation()

  const handleSubmit = async (values: InferType<typeof validationSchema>) => {
    await createVideo({
      variables: {
        input: {
          id: values.id,
          slug: values.slug,
          label: values.label,
          primaryLanguageId: values.primaryLanguageId,
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
            close()
            router.push(`${pathname}/${values.id}`)
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
    label: '' as VideoLabel,
    primaryLanguageId: ''
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
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
          <FormLanguageSelect
            name="primaryLanguageId"
            label="Primary Language"
          />
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
