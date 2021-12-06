import { ReactElement, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import {
  Alert,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Snackbar
} from '@mui/material'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import SingleJourneyUpdateDialog from './SingleJourneyUpdateDialog'
import { UpdateJourneyFields } from './SingleJourneyUpdateDialog/SingleJourneyUpdateDialog'
import { MoreVert, CheckCircleRounded } from '@mui/icons-material'
import { JourneyStatus } from '../../../__generated__/globalTypes'
import { JourneyStatusUpdate } from '../../../__generated__/JourneyStatusUpdate'

export const JOURNEY_STATUS_UPDATE = gql`
  mutation JourneyStatusUpdate($input: JourneyUpdateInput!) {
    journeyUpdate(input: $input) {
      status
    }
  }
`

interface SingleJourneyMenuProps {
  journey: Journey
}

const SingleJourneyMenu = ({
  journey
}: SingleJourneyMenuProps): ReactElement => {
  const [journeyUpdate] = useMutation<JourneyStatusUpdate>(
    JOURNEY_STATUS_UPDATE
  )
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [updateField, setUpdateField] = useState<UpdateJourneyFields>(
    UpdateJourneyFields.TITLE
  )
  const open = Boolean(anchorEl)

  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  const handleCloseAlert = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ): void => {
    if (reason === 'clickaway') {
      return
    }
    setShowAlert(false)
  }

  const handlePublish = async (): Promise<void> => {
    await journeyUpdate({
      variables: { input: JourneyStatus.published },
      optimisticResponse: {
        journeyUpdate: {
          __typename: 'Journey',
          status: JourneyStatus.published
        }
      }
      // TODO: Set server error responses when available
    })
  }

  const handleUpdateTitle = (): void => {
    setUpdateField(UpdateJourneyFields.TITLE)
    setShowDialog(true)
    setAnchorEl(null)
  }

  const handleUpdateDescription = (): void => {
    setUpdateField(UpdateJourneyFields.DESCRIPTION)
    setShowDialog(true)
    setAnchorEl(null)
  }

  const handleUpdateAccess = (): void => {
    // trigger auth dialog
  }

  const handleCopyLink = async (): Promise<void> => {
    // TODO: Need to get full URL
    await navigator.clipboard.writeText(`/journeys/${journey.slug}`)
    setShowAlert(true)
  }

  return (
    <>
      <IconButton
        id="single-journey-actions"
        aria-controls="single-journey-actions"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleShowMenu}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="single-journey-actions"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'journey-actions'
        }}
      >
        <MenuItem>
          <Link href={'https://www.google.com/'} underline="none">
            Preview
          </Link>
        </MenuItem>
        <MenuItem onClick={handlePublish}>Publish</MenuItem>
        <MenuItem onClick={handleUpdateTitle}>Title</MenuItem>
        <MenuItem onClick={handleUpdateDescription}>Description</MenuItem>
        <MenuItem onClick={handleUpdateAccess}>Access</MenuItem>
        <MenuItem>
          <Link href={`/journeys/${journey.slug}/edit`} underline="none">
            Edit Cards
          </Link>
        </MenuItem>
        <MenuItem onClick={handleCopyLink}>Copy Link</MenuItem>
      </Menu>
      <SingleJourneyUpdateDialog
        open={showDialog}
        field={updateField}
        journey={journey}
        onClose={() => setShowDialog(false)}
      />
      <Snackbar
        open={showAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={5000}
        onClose={handleCloseAlert}
      >
        <Alert
          icon={false}
          severity="success"
          action={<CheckCircleRounded sx={{ color: '#5EA10A' }} />}
          sx={{
            width: '286px',
            color: 'white',
            backgroundColor: 'black',
            borderRadius: '2px'
          }}
        >
          Link Copied
        </Alert>
      </Snackbar>
    </>
  )
}

export default SingleJourneyMenu
