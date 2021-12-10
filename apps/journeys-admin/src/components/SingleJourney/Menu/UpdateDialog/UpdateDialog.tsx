import { ReactElement, useEffect, useState } from 'react'
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
import {
  JourneyUpdate,
  JourneyUpdate_journeyUpdate as UpdatedJourney
} from '../../../../../__generated__/JourneyUpdate'
import { useBreakpoints } from '@core/shared/ui'
import { UpdateJourneyFields } from '../Menu'

export const JOURNEY_UPDATE = gql`
  mutation JourneyUpdate($input: JourneyUpdateInput!) {
    journeyUpdate(input: $input) {
      id
      title
      description
    }
  }
`

interface UpdateDialogProps {
  field: UpdateJourneyFields
  open: boolean
  journey: Omit<UpdatedJourney, '__typename'>
  onClose: () => void
  onSuccess: (value: UpdatedJourney) => void
}

const UpdateDialog = ({
  field,
  open,
  journey,
  onClose,
  onSuccess
}: UpdateDialogProps): ReactElement => {
  const [journeyUpdate] = useMutation<JourneyUpdate>(JOURNEY_UPDATE)

  const breakpoints = useBreakpoints()
  const [value, setValue] = useState(
    journey !== undefined ? journey[field] : ''
  )

  useEffect(() => {
    setValue(journey[field])
  }, [journey, field])

  const handleSubmit = async (event): Promise<void> => {
    event.preventDefault()

    const updatedJourney =
      field === UpdateJourneyFields.TITLE
        ? { ...journey, title: value as string }
        : field === UpdateJourneyFields.DESCRIPTION
        ? { ...journey, description: value }
        : journey

    await journeyUpdate({
      variables: { input: updatedJourney },
      optimisticResponse: {
        journeyUpdate: { __typename: 'Journey', ...updatedJourney }
      }
    }).then(() => onSuccess({ __typename: 'Journey', ...updatedJourney }))
  }

  const handleClose = (): void => {
    onClose()
  }

  // TODO: Extract out when adding validation
  const updateForm = (): ReactElement => (
    <Box sx={{ p: 4 }}>
      <form onSubmit={handleSubmit}>
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <FormLabel component="legend" aria-label={`dialog-update-${field}`}>
            <Typography
              variant={'subtitle2'}
              gutterBottom
            >{`Update ${field}`}</Typography>
          </FormLabel>
          <TextField
            value={value}
            multiline={field === UpdateJourneyFields.DESCRIPTION}
            rows={field === UpdateJourneyFields.DESCRIPTION ? 3 : 1}
            maxRows={field === UpdateJourneyFields.DESCRIPTION ? 3 : 1}
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
          aria-labelledby={`dialog-update-${field}`}
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
    </>
  )
}

export default UpdateDialog
