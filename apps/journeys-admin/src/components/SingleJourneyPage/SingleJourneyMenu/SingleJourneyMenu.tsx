import { ReactElement, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import {
  JourneyUpdate,
  JourneyUpdate_journeyUpdate as UpdatedJourney
} from '../../../../__generated__/JourneyUpdate'
import { GET_JOURNEY } from '../../../../pages/journeys/[journeySlug]'
import {
  Alert,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Snackbar
} from '@mui/material'
import SingleJourneyUpdateDialog from './SingleJourneyUpdateDialog'
import { MoreVert, CheckCircleRounded } from '@mui/icons-material'
import { JourneyStatus } from '../../../../__generated__/globalTypes'

export const JOURNEY_UPDATE = gql`
  mutation JourneyUpdate($input: JourneyUpdateInput!) {
    journeyUpdate(input: $input) {
      id
      title
      description
      status
    }
  }
`

export enum UpdateJourneyFields {
  TITLE = 'title',
  DESCRIPTION = 'description',
  STATUS = 'status'
}

export interface SingleJourneyMenuProps {
  journey: UpdatedJourney
  slug: string
  forceOpen?: boolean
}

const SingleJourneyMenu = ({
  journey,
  slug,
  forceOpen
}: SingleJourneyMenuProps): ReactElement => {
  const [journeyUpdate] = useMutation<JourneyUpdate>(JOURNEY_UPDATE, {
    refetchQueries: [
      GET_JOURNEY, // DocumentNode object parsed with gql
      'GetJourney' // Query name
    ]
  })

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [updateField, setUpdateField] = useState<UpdateJourneyFields>(
    UpdateJourneyFields.TITLE
  )

  const openMenu = forceOpen ?? Boolean(anchorEl)

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
      variables: { input: { ...journey, status: JourneyStatus.published } },
      optimisticResponse: {
        journeyUpdate: {
          ...journey,
          status: JourneyStatus.published
        }
      }
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
    await navigator.clipboard.writeText(`your.nextstep.is/${slug}`)
    setShowAlert(true)
  }

  const handleUpdateSuccess = (updatedJourney: UpdatedJourney): void => {
    setShowDialog(false)
  }

  return (
    <>
      <IconButton
        id="single-journey-actions"
        aria-controls="single-journey-actions"
        aria-haspopup="true"
        aria-expanded={openMenu ? 'true' : undefined}
        onClick={handleShowMenu}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="single-journey-actions"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        MenuListProps={{
          'aria-labelledby': 'journey-actions'
        }}
      >
        <MenuItem disabled={journey.status === JourneyStatus.draft}>
          <Link href={'https://www.google.com/'} underline="none">
            Preview
          </Link>
        </MenuItem>
        <MenuItem
          disabled={journey.status === JourneyStatus.published}
          onClick={handlePublish}
        >
          Publish
        </MenuItem>
        <MenuItem onClick={handleUpdateTitle}>Title</MenuItem>
        <MenuItem onClick={handleUpdateDescription}>Description</MenuItem>
        <MenuItem onClick={handleUpdateAccess}>Access</MenuItem>
        <Divider />
        <MenuItem>
          <Link href={`/journeys/${slug}/edit`} underline="none">
            Edit Cards
          </Link>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleCopyLink}>Copy Link</MenuItem>
      </Menu>
      <SingleJourneyUpdateDialog
        open={showDialog}
        field={updateField}
        journey={journey}
        onClose={() => setShowDialog(false)}
        onSuccess={handleUpdateSuccess}
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
