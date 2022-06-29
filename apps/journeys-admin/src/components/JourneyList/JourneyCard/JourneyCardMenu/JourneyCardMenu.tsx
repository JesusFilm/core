import { ReactElement, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import PeopleIcon from '@mui/icons-material/People'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { AccessDialog } from '../../../AccessDialog'
import { DuplicateJourneyMenuItem } from './DuplicateJourneyMenuItem.tsx/DuplicateJourneyMenuItem'

export interface JourneyCardMenuProps {
  id: string
  status: JourneyStatus
  slug: string
  forceMenu?: boolean
  journeyId?: string
}

export function JourneyCardMenu({
  id,
  status,
  slug,
  forceMenu, // this is only used for storybook snapshots
  journeyId
}: JourneyCardMenuProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = forceMenu === true ? true : Boolean(anchorEl)

  const [openDialog, setOpenDialog] = useState(false)

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  return (
    <>
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
        <Link href={`/journeys/${id}`} passHref>
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

        <MenuItem
          sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}
          onClick={() => setOpenDialog(true)}
        >
          <ListItemIcon>
            <PeopleIcon color="secondary" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body1" sx={{ pl: 2 }}>
              Access
            </Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem
          sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}
          disabled={status === JourneyStatus.draft}
          component="a"
          href={`/api/preview?slug=${slug}`}
          target="_blank"
          rel="noopener"
        >
          <ListItemIcon>
            <VisibilityIcon color="secondary" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body1" sx={{ pl: 2 }}>
              Preview
            </Typography>
          </ListItemText>
        </MenuItem>

        <DuplicateJourneyMenuItem journeyId={journeyId} />
      </Menu>

      <AccessDialog
        journeyId={id}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      />
    </>
  )
}
