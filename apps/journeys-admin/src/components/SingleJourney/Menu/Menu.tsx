import { ReactElement, useState, useContext } from 'react'
import { useMutation, gql } from '@apollo/client'
import {
  Divider,
  IconButton,
  Link,
  Menu as MuiMenu,
  MenuItem
} from '@mui/material'
import { MoreVert } from '@mui/icons-material'
import { JourneyPublish } from '../../../../__generated__/JourneyPublish'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { TitleDialog } from './TitleDialog'
import { JourneyContext } from '../Context'
import { DescriptionDialog } from './DescriptionDialog/DescriptionDialog'
import { Alert } from './Alert'

export const JOURNEY_PUBLISH = gql`
  mutation JourneyPublish($id: ID!) {
    journeyPublish(id: $id) {
      id
    }
  }
`

export interface MenuProps {
  forceOpen?: boolean
}

const Menu = ({ forceOpen }: MenuProps): ReactElement => {
  const journey = useContext(JourneyContext)
  const [journeyPublish] = useMutation<JourneyPublish>(JOURNEY_PUBLISH)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [showTitleDialog, setShowTitleDialog] = useState(false)
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)
  const [showLinkAlert, setShowLinkAlert] = useState(false)

  const openMenu = forceOpen ?? Boolean(anchorEl)

  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
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
    setShowTitleDialog(true)
    setAnchorEl(null)
  }

  const handleUpdateDescription = (): void => {
    setShowDescriptionDialog(true)
    setAnchorEl(null)
  }

  const handleCopyLink = async (): Promise<void> => {
    await navigator.clipboard.writeText(`your.nextstep.is/${journey.slug}`)
    setShowLinkAlert(true)
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
      <TitleDialog
        open={showTitleDialog}
        onClose={() => setShowTitleDialog(false)}
      />
      <DescriptionDialog
        open={showDescriptionDialog}
        onClose={() => setShowDescriptionDialog(false)}
      />
      <Alert
        open={showLinkAlert}
        setOpen={setShowLinkAlert}
        message={'Link Copied'}
      />
    </>
  )
}

export default Menu
