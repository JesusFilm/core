import { ApolloError, gql, useMutation } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikValues } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'

import { JourneyTitleUpdate } from '../../../../../../../__generated__/JourneyTitleUpdate'

export const JOURNEY_TITLE_UPDATE = gql`
  mutation JourneyTitleUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      title
    }
  }
`

interface TitleDialogProps {
  open: boolean
  onClose: () => void
}

export function TitleDialog({ open, onClose }: TitleDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [journeyUpdate] = useMutation<JourneyTitleUpdate>(JOURNEY_TITLE_UPDATE)
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const titleSchema = object().shape({
    title: string().required(t('Required'))
  })

  const handleUpdateTitle = async (values: FormikValues): Promise<void> => {
    if (journey == null) return

    try {
      await journeyUpdate({
        variables: { id: journey.id, input: { title: values.title } },
        optimisticResponse: {
          journeyUpdate: {
            id: journey.id,
            __typename: 'Journey',
            title: values.title
          }
        }
      })
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
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      onClose()
      // wait for dialog animation to complete
      setTimeout(() => resetForm({ values: { title: journey?.title } }))
    }
  }

  return (
    <>
      {journey != null && (
        <Formik
          initialValues={{ title: journey.title }}
          onSubmit={handleUpdateTitle}
          validationSchema={titleSchema}
        >
          {({ values, errors, handleChange, handleSubmit, resetForm }) => (
            <Dialog
              open={open}
              onClose={handleClose(resetForm)}
              dialogTitle={{ title: t('Edit Title') }}
              dialogAction={{
                onSubmit: handleSubmit,
                closeLabel: t('Cancel')
              }}
              testId="TitleDialog"
            >
              <Form>
                <TextField
                  id="title"
                  name="title"
                  hiddenLabel
                  fullWidth
                  value={values.title}
                  variant="filled"
                  error={Boolean(errors.title)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onChange={handleChange}
                  helperText={errors.title as string}
                />
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </>
  )
}
