import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { useSnackbar } from 'notistack'
import { Formik, Form } from 'formik'
import { JourneyTitleUpdate } from '../../../../../__generated__/JourneyTitleUpdate'
import { useJourney } from '../../../../libs/context'
import { Dialog } from '../../../Dialog'

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
  const [journeyUpdate] = useMutation<JourneyTitleUpdate>(JOURNEY_TITLE_UPDATE)
  const journey = useJourney()
  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = async (values): Promise<void> => {
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
      enqueueSnackbar('There was an error updating title', { variant: 'error' })
    }
  }

  function handleClose(resetForm: () => void): () => void {
    return () => {
      resetForm()
      onClose()
    }
  }

  return (
    <>
      {journey != null && (
        <Formik
          initialValues={{ title: journey.title }}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, handleSubmit, resetForm }) => (
            <Dialog
              open={open}
              handleClose={handleClose(resetForm)}
              dialogTitle={{ title: 'Edit Title' }}
              dialogAction={{
                onSubmit: handleSubmit,
                closeLabel: 'Cancel'
              }}
            >
              <Form>
                <TextField
                  id="title"
                  name="title"
                  hiddenLabel
                  fullWidth
                  value={values.title}
                  variant="filled"
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
