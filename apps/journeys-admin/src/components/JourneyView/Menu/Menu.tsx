import { ReactElement, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import MoreVert from '@mui/icons-material/MoreVert'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DescriptionIcon from '@mui/icons-material/Description'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel'
import NextLink from 'next/link'
import { useJourney } from '../../../libs/Context'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyPublish } from '../../../../__generated__/JourneyPublish'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { Alert } from './Alert'
import { DescriptionDialog } from './DescriptionDialog/DescriptionDialog'
import { TitleDialog } from './TitleDialog'

export const JOURNEY_PUBLISH = gql`
  mutation JourneyPublish($id: ID!) {
    journeyPublish(id: $id) {
      id
    }
  }
`

interface MenuProps {
  forceOpen?: boolean
}

export function Menu({ forceOpen }: MenuProps): ReactElement {
  const journey: Journey = useJourney()
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
        MenuListProps={{
          'aria-labelledby': 'journey-actions'
        }}
      >
        <MenuItem
          disabled={journey.status === JourneyStatus.draft}
          component="a"
          href={`http://your.nextstep.is/${journey.slug}`}
        >
          <ListItemIcon>
            <AssignmentTurnedInIcon />
          </ListItemIcon>
          <ListItemText>Preview</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={journey.status === JourneyStatus.published}
          onClick={handlePublish}
        >
          <ListItemIcon>
            <VisibilityIcon />
          </ListItemIcon>
          <ListItemText>Publish</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleUpdateTitle}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Title</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleUpdateDescription}>
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText>Description</ListItemText>
        </MenuItem>
        <Divider />
        <NextLink href={`/journeys/${journey.slug}/edit`} passHref>
          <MenuItem>
            <ListItemIcon>
              <ViewCarouselIcon />
            </ListItemIcon>
            <ListItemText>Edit Cards</ListItemText>
          </MenuItem>
        </NextLink>
        <Divider />
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>
            <ContentCopyIcon />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
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
        message="Link Copied"
      />
    </>
  )
}
