'use client'

import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { Form, Formik } from 'formik'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { object, string } from 'yup'

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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          '& .MuiDialogTitle-root': {
            borderBottom: '1px solid',
            borderColor: 'divider'
          }
        }
      }}
    >
      <DialogTitle>Add Edition</DialogTitle>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          <Form data-testId="EditionForm">
            <Stack gap={2}>
              <FormTextField name="name" label="Name" fullWidth />
              <Stack direction="row" gap={1}>
                <Button variant="contained" type="submit" fullWidth>
                  Create
                </Button>
              </Stack>
            </Stack>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  )
}
