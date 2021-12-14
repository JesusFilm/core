import { ReactElement, useState, useContext } from 'react'
import { useMutation, gql } from '@apollo/client'
import {
  Box,
  Button,
  Drawer,
  Dialog,
  FormControl,
  FormLabel,
  TextField,
  Typography
} from '@mui/material'
import { JourneyTitleUpdate } from '../../../../../__generated__/JourneyTitleUpdate'
import { useBreakpoints } from '@core/shared/ui'
import { Alert } from '../Alert'
import { JourneyContext } from '../../Context'

export const JOURNEY_TITLE_UPDATE = gql`
  mutation JourneyTitleUpdate($input: JourneyUpdateInput!) {
    journeyUpdate(input: $input) {
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
  const journey = useContext(JourneyContext)

  const breakpoints = useBreakpoints()
  const [value, setValue] = useState(journey !== undefined ? journey.title : '')
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  const handleSubmit = async (event): Promise<void> => {
    event.preventDefault()

    const updatedJourney = { id: journey.id, title: value }

    await journeyUpdate({
      variables: { input: updatedJourney },
      optimisticResponse: {
        journeyUpdate: { __typename: 'Journey', ...updatedJourney }
      }
    }).then(() => setShowSuccessAlert(true))
  }

  const handleClose = (): void => {
    onClose()
  }

  const updateForm = (): ReactElement => (
    <Box sx={{ p: 4 }}>
      <form onSubmit={handleSubmit}>
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <FormLabel component="legend" aria-label={'dialog-update-title'}>
            <Typography variant={'subtitle2'} gutterBottom>
              {'Update Title'}
            </Typography>
          </FormLabel>
          <TextField
            value={value}
            variant="filled"
            onChange={(e) => setValue(e.currentTarget.value)}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignSelf: 'flex-end'
            }}
          >
            <Button sx={{ mt: 1, mr: 1 }} onClick={handleClose} variant="text">
              Cancel
            </Button>
            <Button sx={{ mt: 1, mr: 1 }} type="submit" variant="text">
              Save
            </Button>
          </Box>
        </FormControl>
      </form>
    </Box>
  )

  return (
    <>
      {breakpoints.md ? (
        <Dialog
          id={'update-journey-dialog'}
          open={open}
          onClose={handleClose}
          aria-labelledby={'dialog-update-title'}
        >
          {updateForm()}
        </Dialog>
      ) : (
        <Drawer
          id={'update-journey-drawer'}
          anchor={'bottom'}
          open={open}
          onClose={handleClose}
        >
          {updateForm()}
        </Drawer>
      )}
      <Alert
        open={showSuccessAlert}
        setOpen={setShowSuccessAlert}
        message={'Title updated successfully'}
      />
    </>
  )
}

export default TitleDialog
