import { ReactElement, useState } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  Link,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import PeopleIcon from '@mui/icons-material/People'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'

// Pass journeyID and slug to JourneyCardMenu
interface JourneyCardMenuProps {
  status: JourneyStatus
  slug: string
}

const JourneyCardMenu = ({
  status,
  slug
}: JourneyCardMenuProps): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  return (
    <div>
      <IconButton
        id="journey-actions"
        aria-controls="journey-actions"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        onClick={handleOpenMenu}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="journey-actions"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'journey-actions'
        }}
      >
        <Link href={`/journeys/${slug}/edit`} underline="none">
          <MenuItem>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        </Link>

        {/* update link */}
        <Link href={`/journeys/${slug}/access`} underline="none">
          <MenuItem>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText>Change Access</ListItemText>
          </MenuItem>
        </Link>

        {status === JourneyStatus.draft ? (
          <MenuItem disabled>
            <ListItemIcon>
              <VisibilityIcon />
            </ListItemIcon>
            <ListItemText>Preview</ListItemText>
          </MenuItem>
        ) : (
          <Link href={`/journeys/${slug}/preview`} underline="none">
            {/* update link */}
            <MenuItem>
              <ListItemIcon>
                <VisibilityIcon />
              </ListItemIcon>
              <ListItemText>Preview</ListItemText>
            </MenuItem>
          </Link>
        )}
      </Menu>
    </div>
  )
}

export default JourneyCardMenu
