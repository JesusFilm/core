import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import TextField from '@mui/material/TextField'
import { useSnackbar } from 'notistack'
import { Formik, Form, FormikValues } from 'formik'
import { JourneyDescUpdate } from '../../../../../__generated__/JourneyDescUpdate'
import { useJourney } from '../../../../libs/context'
import { Dialog } from '../../../Dialog'

export const JOURNEY_DESC_UPDATE = gql`
  mutation JourneyDescUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      description
    }
  }
`

interface DescriptionDialogProps {
  open: boolean
  onClose: () => void
}

export function DescriptionDialog({
  open,
  onClose
}: DescriptionDialogProps): ReactElement {
  const [journeyUpdate] = useMutation<JourneyDescUpdate>(JOURNEY_DESC_UPDATE)
  const journey = useJourney()
  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = async (values: FormikValues): Promise<void> => {
    if (journey == null) return

    try {
      await journeyUpdate({
        variables: {
          id: journey.id,
          input: { description: values.description }
        },
        optimisticResponse: {
          journeyUpdate: {
            id: journey.id,
            __typename: 'Journey',
            description: values.description
          }
        }
      })
      onClose()
    } catch (error) {
      enqueueSnackbar('There was an error updating description', {
        variant: 'error'
      })
    }
  }

  function handleClose(resetForm: (values: FormikValues) => void): () => void {
    return () => {
      resetForm({ values: { description: journey?.description } })
      onClose()
    }
  }

  return (
    <>
      {journey != null && (
        <Formik
          initialValues={{ description: journey.description ?? '' }}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, handleSubmit, resetForm }) => (
            <Dialog
              open={open}
              handleClose={handleClose(resetForm)}
              dialogTitle={{ title: 'Edit Description' }}
              dialogAction={{
                onSubmit: handleSubmit,
                closeLabel: 'Cancel'
              }}
            >
              <Form>
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
