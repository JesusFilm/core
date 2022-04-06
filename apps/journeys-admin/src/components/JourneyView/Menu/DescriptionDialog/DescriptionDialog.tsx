import { ReactElement, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import { JourneyDescUpdate } from '../../../../../__generated__/JourneyDescUpdate'
import { Alert } from '../Alert'
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

  const [value, setValue] = useState(
    journey !== undefined ? journey.description : ''
  )
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  const handleSubmit = async (): Promise<void> => {
    const updatedJourney = { description: value }

    await journeyUpdate({
      variables: { id: journey.id, input: updatedJourney },
      optimisticResponse: {
        journeyUpdate: {
          id: journey.id,
          __typename: 'Journey',
          ...updatedJourney
        }
      }
    }).then(() => setShowSuccessAlert(true))
  }

  const handleClose = (): void => {
    onClose()
  }

  const dialogProps = {
    open,
    handleClose,
    dialogTitle: { title: 'Edit Description' },
    dialogAction: {
      onSubmit: handleSubmit,
      closeLabel: 'Cancel'
    }
  }

  return (
    <>
      <Dialog {...dialogProps}>
        <form onSubmit={handleSubmit}>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <TextField
              hiddenLabel
              value={value}
              multiline
              variant="filled"
              rows={3}
              onChange={(e) => setValue(e.currentTarget.value)}
            />
          </FormControl>
        </form>
      </Dialog>

      <Alert
        open={showSuccessAlert}
        setOpen={setShowSuccessAlert}
        message="Description updated successfully"
      />
    </>
  )
}
