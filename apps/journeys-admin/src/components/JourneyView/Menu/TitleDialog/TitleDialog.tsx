import { ReactElement, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import { JourneyTitleUpdate } from '../../../../../__generated__/JourneyTitleUpdate'
import { Alert } from '../Alert'
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

  const [value, setValue] = useState(journey?.title ?? '')
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  const handleSubmit = async (): Promise<void> => {
    const updatedJourney = { title: value }

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

    setShowSuccessAlert(true)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value)
  }

  const handleClose = (): void => {
    onClose()
  }

  const dialogProps = {
    open,
    handleClose,
    dialogTitle: { title: 'Edit Title' },
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
              variant="filled"
              onChange={handleChange}
            />
          </FormControl>
        </form>
      </Dialog>
      <Alert
        open={showSuccessAlert}
        setOpen={setShowSuccessAlert}
        message="Title updated successfully"
      />
    </>
  )
}
