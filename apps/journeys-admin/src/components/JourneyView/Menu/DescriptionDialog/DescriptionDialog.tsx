import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import { useSnackbar } from 'notistack'
import { useFormik } from 'formik'
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

  const handleSubmit = async (): Promise<void> => {
    if (journey == null) return

    const updatedJourney = { description: formik.values.description }

    try {
      await journeyUpdate({
        variables: { id: journey.id, input: updatedJourney },
        optimisticResponse: {
          journeyUpdate: {
            id: journey.id,
            __typename: 'Journey',
            ...updatedJourney
          }
        }
      })
    } catch (error) {
      enqueueSnackbar('There was an error updating description', {
        variant: 'error'
      })
    }
  }

  const handleClose = (): void => {
    formik.resetForm()
    onClose()
  }

  const formik = useFormik({
    initialValues: {
      description: journey?.description ?? ''
    },
    onSubmit: handleSubmit,
    enableReinitialize: true
  })

  return (
    <>
      <Dialog
        open={open}
        handleClose={handleClose}
        dialogTitle={{ title: 'Edit Description' }}
        dialogAction={{
          onSubmit: handleSubmit,
          closeLabel: 'Cancel'
        }}
      >
        <form onSubmit={handleSubmit}>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel
              component="legend"
              aria-label="form-update-description"
            />
            <TextField
              id="description"
              name="description"
              hiddenLabel
              value={formik.values.description}
              multiline
              variant="filled"
              rows={3}
              onChange={formik.handleChange}
            />
          </FormControl>
        </form>
      </Dialog>
    </>
  )
}
