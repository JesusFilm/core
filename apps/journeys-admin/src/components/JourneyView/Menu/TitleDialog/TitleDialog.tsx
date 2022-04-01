import { ReactElement, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
// import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useBreakpoints } from '@core/shared/ui'
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

  const breakpoints = useBreakpoints()
  const [value, setValue] = useState(journey !== undefined ? journey.title : '')
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

  const handleClose = (): void => {
    onClose()
  }

  const Form = (): ReactElement => (
    <form onSubmit={handleSubmit}>
      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <TextField
          value={value}
          variant="filled"
          onChange={(e) => {
            setValue(e.currentTarget.value)
          }}
        />
      </FormControl>
    </form>
  )

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
      {breakpoints.md ? (
        <Dialog {...dialogProps}>
          <Form />
        </Dialog>
      ) : (
        <Drawer anchor="bottom" open={open} onClose={handleClose}>
          <Box sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <FormLabel component="legend" aria-label="dialog-update-title">
                  <Typography variant="subtitle2" gutterBottom>
                    Edit Title
                  </Typography>
                </FormLabel>
                <Form />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignSelf: 'flex-end'
                  }}
                >
                  <Button
                    sx={{ mt: 1, mr: 1 }}
                    onClick={handleClose}
                    variant="text"
                  >
                    Cancel
                  </Button>
                  <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="text">
                    Save
                  </Button>
                </Box>
              </FormControl>
            </form>
          </Box>
        </Drawer>
      )}
      <Alert
        open={showSuccessAlert}
        setOpen={setShowSuccessAlert}
        message="Title updated successfully"
      />
    </>
  )
}
