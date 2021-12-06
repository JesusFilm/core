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
import { JourneyUpdate } from '../../../../__generated__/JourneyUpdate'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { useBreakpoints } from '@core/shared/ui'
import { GET_JOURNEY } from '../../../../pages/journeys/[journeySlug]'

export const JOURNEY_UPDATE = gql`
  mutation JourneyUpdate($input: JourneyUpdateInput!) {
    journeyUpdate(input: $input) {
      id
      title
      description
    }
  }
`
export enum UpdateJourneyFields {
  TITLE = 'title',
  DESCRIPTION = 'description'
}

interface SingleJourneyUpdateDialogProps {
  field: UpdateJourneyFields
  open: boolean
  journey: Journey
  onClose: () => void
}

const SingleJourneyUpdateDialog = ({
  field,
  open,
  journey,
  onClose
}: SingleJourneyUpdateDialogProps): ReactElement => {
  const breakpoints = useBreakpoints()
  const [journeyUpdate] = useMutation<JourneyUpdate>(JOURNEY_UPDATE, {
    refetchQueries: [
      GET_JOURNEY, // DocumentNode object parsed with gql
      'GetJourney' // Query name
    ]
  })
  const [value, setValue] = useState(
    journey !== undefined ? journey[field] : ''
  )

  useEffect(() => {
    setValue(journey[field])
  }, [journey, field])

  const handleSubmit = async (event): Promise<void> => {
    event.preventDefault()

    const updateValue =
      field === UpdateJourneyFields.TITLE
        ? { title: value as string, description: journey.description }
        : { title: journey.title, description: value }

    await journeyUpdate({
      variables: { input: { id: journey.id, ...updateValue } },
      optimisticResponse: {
        journeyUpdate: {
          id: journey.id,
          __typename: 'Journey',
          ...updateValue
        }
      }
      // TODO: Set server error responses when available
    })

    handleClose()
  }

  const handleClose = (): void => {
    onClose()
  }

  const updateForm = (): ReactElement => (
    <Box sx={{ p: 4 }}>
      <form onSubmit={handleSubmit}>
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <FormLabel component="legend">
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
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
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

export default SingleJourneyUpdateDialog
