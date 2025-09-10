'use client'

import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { object, string } from 'yup'
import { useTranslation } from 'next-i18next'

import { graphql } from '@core/shared/gql'
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

  const { t } = useTranslation('apps-videos-admin')

  const validationSchema = object().shape({
    name: string().required(t('Name is required'))
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
        enqueueSnackbar(t('Successfully created edition.'), {
          variant: 'success'
        })
        router.push(`/videos/${videoId}/editions`, {
          scroll: false
        })
      },
      onError: () => {
        enqueueSnackbar(t('Failed to create edition.'), { variant: 'error' })
      }
    })
  }
  const initialValues = { name: '' }

  return (
    <Dialog
      open={true}
      onClose={() =>
        router.push(`/videos/${videoId}/editions`, {
          scroll: false
        })
      }
      dialogTitle={{
        title: t('Add Edition'),
        closeButton: true
      }}
      testId="add-edition-dialog"
    >
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        <Form data-testid="EditionForm">
          <Stack gap={2}>
            <FormTextField name="name" label={t('Name')} fullWidth sx={{ mt: 1 }} />
            <Button variant="contained" type="submit" fullWidth>
              {t('Create')}
            </Button>
          </Stack>
        </Form>
      </Formik>
    </Dialog>
  )
}
