import { ReactElement, useState } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography
} from '@mui/material'
import Link from 'next/link'
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

export function JourneyCardMenu({
  status,
  slug,
  forceMenu // this is only used for storybook snapshots
}: JourneyCardMenuProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = forceMenu === true ? true : Boolean(anchorEl)

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
        <Link href={`/journeys/${slug}/edit`} passHref>
          <MenuItem sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}>
            <ListItemIcon>
              <EditIcon color="secondary" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body1" sx={{ pl: 2 }}>
                Edit
              </Typography>
            </ListItemText>
          </MenuItem>
        </Link>

        <MenuItem sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}>
          <ListItemIcon>
            <PeopleIcon color="secondary" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body1" sx={{ pl: 2 }}>
              Access
            </Typography>
          </ListItemText>
        </MenuItem>

        {status === JourneyStatus.draft ? (
          <MenuItem disabled sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}>
            <ListItemIcon>
              <VisibilityIcon color="secondary" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body1" sx={{ pl: 2 }}>
                Preview
              </Typography>
            </ListItemText>
          </MenuItem>
        ) : (
          <Link href={`https://your.nextstep.is/${slug}`} passHref>
            <MenuItem sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}>
              <ListItemIcon>
                <VisibilityIcon color="secondary" />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body1" sx={{ pl: 2 }}>
                  Preview
                </Typography>
              </ListItemText>
            </MenuItem>
          </Link>
        )}
      </Menu>
    </div>
  )
}
