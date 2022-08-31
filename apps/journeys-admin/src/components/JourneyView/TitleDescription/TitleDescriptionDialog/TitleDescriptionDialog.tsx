import { ReactElement } from 'react'
import { useMutation, gql, ApolloError } from '@apollo/client'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { Formik, Form, FormikValues } from 'formik'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TitleDescriptionUpdate } from '../../../../../__generated__/TitleDescriptionUpdate'
import { Dialog } from '../../../Dialog'

export const TITLE_DESCRIPTION_UPDATE = gql`
  mutation TitleDescriptionUpdate(
    $id: ID!
    $input: JourneyUpdateInput!
  ) {
    journeyUpdate(id: $id, input: $input) {
      id
      title
      description
    }
  }
`
interface TitleDescriptionDialogProps {
  open: boolean
  onClose: () => void
}

export function TitleDescriptionDialog({
  open,
  onClose
}: TitleDescriptionDialogProps): ReactElement {
  const [templateUpdate] = useMutation<TitleDescriptionUpdate>(
    TITLE_DESCRIPTION_UPDATE
  )
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()

  const handleUpdateTitle = async (values: FormikValues): Promise<void> => {
    if (journey == null) return

    try {
      await templateUpdate({
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
            'Field update failed. Reload the page or try again.',
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
            title: journey.title ?? '',
            description: journey?.description ?? ''
          }}
          onSubmit={handleUpdateTitle}
        >
          {({ values, handleChange, handleSubmit, resetForm }) => (
            <Dialog
              open={open}
              handleClose={handleClose(resetForm)}
              dialogTitle={{ title: 'Edit Title and Description' }}
              dialogAction={{
                onSubmit: handleSubmit,
                closeLabel: 'Cancel'
              }}
              divider
            >
              <Form>
                <Typography variant="body1" gutterBottom>
                  Journey Title
                </Typography>
                <TextField
                  id="title"
                  name="title"
                  hiddenLabel
                  fullWidth
                  value={values.title}
                  variant="filled"
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body1" gutterBottom>
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
                  rows={3}
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
