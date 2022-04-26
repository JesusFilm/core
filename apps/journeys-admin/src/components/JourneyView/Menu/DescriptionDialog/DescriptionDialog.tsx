import { ReactElement, useState, useEffect } from 'react'
import { useMutation, gql } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import { useSnackbar } from 'notistack'
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

  const [value, setValue] = useState(journey?.description ?? '')
  useEffect(() => {
    setValue(journey?.description ?? '')
  }, [journey])

  const handleSubmit = async (): Promise<void> => {
    if (journey == null) return

    const updatedJourney = { description: value }

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
    setValue(journey?.description ?? '')
    onClose()
  }

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
    </>
  )
}
