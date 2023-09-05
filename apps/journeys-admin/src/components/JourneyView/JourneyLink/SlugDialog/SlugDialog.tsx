import { ApolloError, gql, useMutation } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikHelpers, FormikValues } from 'formik'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'

import { JourneySlugUpdate } from '../../../../../__generated__/JourneySlugUpdate'

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
  const slugSchema = object().shape({
    slug: string().required('Required')
  })

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
          validationSchema={slugSchema}
        >
          {({ values, errors, handleChange, handleSubmit, resetForm }) => (
            <Dialog
              open={open}
              onClose={handleClose(resetForm)}
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
                  error={Boolean(errors.slug)}
                  onChange={handleChange}
                  helperText={
                    values.slug !== '' ? (
                      <>
                        {process.env.NEXT_PUBLIC_JOURNEYS_URL ??
                          'https://your.nextstep.is'}
                        /<strong>{values.slug}</strong>
                      </>
                    ) : (
                      (errors.slug as string)
                    )
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
