import { ReactElement, useState, useContext } from 'react'
import { useMutation, gql } from '@apollo/client'
import {
  Alert,
  Divider,
  IconButton,
  Link,
  Menu as MuiMenu,
  MenuItem,
  Snackbar
} from '@mui/material'
import { MoreVert, CheckCircleRounded } from '@mui/icons-material'
import { JourneyUpdate_journeyUpdate as UpdatedJourney } from '../../../../__generated__/JourneyUpdate'
import { JourneyPublish } from '../../../../__generated__/JourneyPublish'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import UpdateDialog from './UpdateDialog'
import { JourneyContext } from '../Context'

export const JOURNEY_PUBLISH = gql`
  mutation JourneyPublish($id: ID!) {
    journeyPublish(id: $id) {
      id
    }
  }
`

export enum UpdateJourneyFields {
  TITLE = 'title',
  DESCRIPTION = 'description'
}

export interface MenuProps {
  forceOpen?: boolean
}

const Menu = ({ forceOpen }: MenuProps): ReactElement => {
  const journey = useContext(JourneyContext)
  const [journeyPublish] = useMutation<JourneyPublish>(JOURNEY_PUBLISH)
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
    await journeyPublish({
      variables: { id: journey.id },
      optimisticResponse: {
        journeyPublish: { id: journey.id, __typename: 'Journey' }
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

  const handleCopyLink = async (): Promise<void> => {
    await navigator.clipboard.writeText(`your.nextstep.is/${journey.slug}`)
    setShowAlert(true)
  }

  const handleUpdateSuccess = (updatedJourney: UpdatedJourney): void => {
    setShowDialog(false)
  }

  return (
    <>
      <IconButton
        id="single-journey-actions"
        edge="end"
        aria-controls="single-journey-actions"
        aria-haspopup="true"
        aria-expanded={openMenu ? 'true' : undefined}
        onClick={handleShowMenu}
      >
        <MoreVert />
      </IconButton>
      <MuiMenu
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
          <Link
            href={`http://your.nextstep.is/${journey.slug}`}
            underline="none"
          >
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

        <Divider />
        <MenuItem>
          <Link href={`/journeys/${journey.slug}/edit`} underline="none">
            Edit Cards
          </Link>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleCopyLink}>Copy Link</MenuItem>
      </MuiMenu>
      <UpdateDialog
        open={showDialog}
        field={updateField}
        journey={{
          id: journey.id,
          title: journey.title,
          description: journey.description
        }}
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

export default Menu
