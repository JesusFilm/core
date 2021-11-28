import { ReactElement, useState } from 'react'
import { IconButton, Menu, MenuItem, Divider, useTheme } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Link from 'next/link'
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
  const theme = useTheme()

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
        aria-expanded={open ? 'true' : undefined}
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
          <MenuItem>Edit</MenuItem>
        </Link>
        {/* update link */}
        <Link href={`/journeys/${slug}/access`} passHref>
          <MenuItem>Change Access</MenuItem>
        </Link>

        <Divider />
        {status === JourneyStatus.draft ? (
          <MenuItem disabled>Preview</MenuItem>
        ) : (
          <MenuItem>
            {/* update link */}
            <a
              style={{
                textDecoration: 'none',
                color: theme.palette.primary.main
              }}
              href="#"
            >
              Preview
            </a>
          </MenuItem>
        )}
      </Menu>
    </div>
  )
}

export default JourneyCardMenu
