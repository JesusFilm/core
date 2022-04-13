import { ReactElement, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import { useSnackbar } from 'notistack'
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

  const [value, setValue] = useState(journey?.title ?? '')

  const handleSubmit = async (): Promise<void> => {
    if (journey == null) return

    const updatedJourney = { title: value }

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
      enqueueSnackbar('There was an error updating title', { variant: 'error' })
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value)
  }

  const handleClose = (): void => {
    onClose()
  }

  return (
    <>
      <Dialog
        open={open}
        handleClose={handleClose}
        dialogTitle={{ title: 'Edit Title' }}
        dialogAction={{
          onSubmit: handleSubmit,
          closeLabel: 'Cancel'
        }}
      >
        <form onSubmit={handleSubmit}>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" aria-label="form-update-title" />
            <TextField
              hiddenLabel
              value={value}
              variant="filled"
              onChange={handleChange}
            />
          </FormControl>
        </form>
      </Dialog>
    </>
  )
}
