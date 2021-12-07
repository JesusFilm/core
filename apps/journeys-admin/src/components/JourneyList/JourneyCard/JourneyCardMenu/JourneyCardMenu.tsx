import { ReactElement, useState } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Link
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import PeopleIcon from '@mui/icons-material/People'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'

export interface JourneyCardMenuProps {
  status: JourneyStatus
  slug: string
  forceMenu?: boolean
}

const JourneyCardMenu = ({
  status,
  slug,
  forceMenu // this is only used for storybook snapshots
}: JourneyCardMenuProps): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = forceMenu === true ? true : Boolean(anchorEl)

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    // show modal
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
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
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

        <MenuItem onClick={handleClick}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText>Access</ListItemText>
        </MenuItem>

        {status === JourneyStatus.draft ? (
          <MenuItem disabled>
            <ListItemIcon>
              <VisibilityIcon />
            </ListItemIcon>
            <ListItemText>Preview</ListItemText>
          </MenuItem>
        ) : (
          <Link href={`https://your.NextStep.is/${slug}`} underline="none">
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
