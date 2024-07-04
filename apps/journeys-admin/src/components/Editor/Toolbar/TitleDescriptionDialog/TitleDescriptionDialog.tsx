import { ApolloError, gql, useMutation } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikValues } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'

import { Typography } from '@mui/material'
import { JourneyTitleDescriptionUpdate } from '../../../../../__generated__/JourneyTitleDescriptionUpdate'

export const JOURNEY_TITLE_DESCRIPTION_UPDATE = gql`
  mutation JourneyTitleDescriptionUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      title
      description
    }
  }
`

interface TitleDialogProps {
  open: boolean
  onClose: () => void
}

export function TitleDescriptionDialog({
  open,
  onClose
}: TitleDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [journeyUpdate] = useMutation<JourneyTitleDescriptionUpdate>(
    JOURNEY_TITLE_DESCRIPTION_UPDATE
  )
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const titleSchema = object().shape({
    title: string().required(t('Required'))
  })

  const handleUpdateTitleDescription = async (
    values: FormikValues
  ): Promise<void> => {
    if (journey == null) return

    try {
      await journeyUpdate({
        variables: {
          id: journey.id,
          input: { title: values.title, description: values.description }
        },
        optimisticResponse: {
          journeyUpdate: {
            id: journey.id,
            __typename: 'Journey',
            title: values.title,
            description: values.description
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
      setTimeout(() =>
        resetForm({
          values: { title: journey?.title, description: journey?.description }
        })
      )
    }
  }

  return (
    <>
      {journey != null && (
        <Formik
          initialValues={{
            title: journey.title,
            description: journey.description
          }}
          onSubmit={handleUpdateTitleDescription}
          validationSchema={titleSchema}
        >
          {({ values, errors, handleChange, handleSubmit, resetForm }) => (
            <Dialog
              open={open}
              onClose={handleClose(resetForm)}
              dialogTitle={{ title: t('Title') }}
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
                <Typography
                  variant="subtitle1"
                  style={{ marginLeft: -1, paddingTop: 20, paddingBottom: 16 }}
                >
                  Description
                </Typography>
                <TextField
                  id="description"
                  name="description"
                  hiddenLabel
                  fullWidth
                  value={values.description}
                  multiline
                  variant="filled"
                  rows={2}
                  onChange={handleChange}
                />
              </Form>
            </Dialog>
          )}
        </Formik>
      )}
    </>
  )
}
