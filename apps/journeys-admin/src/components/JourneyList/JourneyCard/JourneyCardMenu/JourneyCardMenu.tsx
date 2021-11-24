import { ReactElement, useState } from 'react'
import { IconButton, Menu, MenuItem } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'

// Pass journeyID and slug to JourneyCardMenu

const JourneyCardMenu = (): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  const handleEdit = (): void => {
    // trigger LinkAction to Edit Card page Tatai makes
  }
  const handleDuplicate = (): void => {
    // trigger the duplicate journey mutation based on journey.id
  }
  const handleChangeAccess = (): void => {
    // trigger the change access modal that John / Gavin build
  }
  const handleCopyUrl = (): void => {
    // get journey.slug and save to client clipboard
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
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
        <MenuItem onClick={handleChangeAccess}>Change Access</MenuItem>
        <MenuItem onClick={handleCopyUrl}>Copy URL</MenuItem>
      </Menu>
    </div>
  )
}

export default JourneyCardMenu
