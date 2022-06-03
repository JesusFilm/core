import { ReactElement } from 'react'
import { useMutation, gql, ApolloError } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { useSnackbar } from 'notistack'
import { Formik, Form, FormikValues, FormikHelpers } from 'formik'
import { useJourney } from '@core/journeys/ui'
import { useTranslation } from 'react-i18next'
import { JourneySlugUpdate } from '../../../../../__generated__/JourneySlugUpdate'
import { Dialog } from '../../../Dialog'

export const JOURNEY_SLUG_UPDATE = gql`
  mutation JourneySlugUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      slug
    }
  }
`

interface SlugDialogProps {
  open: boolean
  onClose: () => void
}

export function SlugDialog({ open, onClose }: SlugDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [journeyUpdate] = useMutation<JourneySlugUpdate>(JOURNEY_SLUG_UPDATE)
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()

  const handleUpdateSlug = async (
    values: FormikValues,
    { setValues }: FormikHelpers<FormikValues>
  ): Promise<void> => {
    if (journey == null) return

    try {
      const response = await journeyUpdate({
        variables: { id: journey.id, input: { slug: values.slug } }
      })
      setValues({ slug: response?.data?.journeyUpdate.slug })
      onClose()
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.networkError != null) {
          enqueueSnackbar(
            t('Field update failed. Reload the page or try again.'),
            {
              variant: 'error',
              preventDuplicate: true
            }
          )
          return
        }
      }
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(() => resetForm({ values: { slug: journey?.slug } }))
    }
  }

  return (
    <>
      {journey != null && (
        <Formik
          initialValues={{ slug: journey.slug }}
          onSubmit={handleUpdateSlug}
        >
          {({ values, handleChange, handleSubmit, resetForm }) => (
            <Dialog
              open={open}
              handleClose={handleClose(resetForm)}
              dialogTitle={{ title: t('Edit URL') }}
              dialogAction={{
                onSubmit: handleSubmit,
                closeLabel: t('Cancel')
              }}
            >
              <Form>
                <TextField
                  id="slug"
                  name="slug"
                  hiddenLabel
                  fullWidth
                  value={values.slug}
                  variant="filled"
                  onChange={handleChange}
                  helperText={
                    <>
                      {process.env.NEXT_PUBLIC_JOURNEYS_URL ??
                        'https://your.nextstep.is'}
                      /<strong>{values.slug}</strong>
                    </>
                  }
                />
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </>
  )
}
