'use client'

import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Form, Formik } from 'formik'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'

import { FormTextField } from '../../../../../../components/FormTextField'

const CREATE_VIDEO_EDITION = graphql(`
  mutation CreateVideoEdition($input: VideoEditionCreateInput!) {
    videoEditionCreate(input: $input) {
      id
      name
    }
  }
`)

interface AddEditionPageProps {
  params: {
    videoId: string
  }
}

export default function AddEditionPage({
  params: { videoId }
}: AddEditionPageProps) {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [createEdition] = useMutation(CREATE_VIDEO_EDITION)

  const validationSchema = object().shape({
    name: string().required('Name is required')
  })

  const handleSubmit = async (values: { name: string }) => {
    await createEdition({
      variables: {
        input: {
          videoId: videoId,
          name: values.name
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Successfully created edition.', {
          variant: 'success'
        })
        router.push(`/videos/${videoId}/editions`)
      },
      onError: () => {
        enqueueSnackbar('Failed to create edition.', { variant: 'error' })
      }
    })
  }
  const initialValues = { name: '' }

  return (
    <Dialog
      open={true}
      onClose={() => router.push(`/videos/${videoId}/editions`)}
      dialogTitle={{
        title: 'Add Edition',
        closeButton: true
      }}
      testId="add-edition-dialog"
    >
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        <Form data-testId="EditionForm">
          <Stack gap={2}>
            <FormTextField name="name" label="Name" fullWidth />
            <Button variant="contained" type="submit" fullWidth>
              Create
            </Button>
          </Stack>
        </Form>
      </Formik>
    </Dialog>
  )
}
