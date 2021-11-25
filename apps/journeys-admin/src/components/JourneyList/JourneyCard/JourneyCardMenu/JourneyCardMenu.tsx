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
  const handleChangeAccess = (): void => {
    // trigger the change access modal that John / Gavin build
  }
  const handlePreview = (): void => {
    // tirgger link action to journey preview
  }

  return (
    <div>
      {/* https://mui.com/components/material-icons/ use correct icon */}
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
        <MenuItem onClick={handleChangeAccess}>Change Access</MenuItem>
        {/* 'Grey out' preview if journey is draft */}
        <MenuItem onClick={handlePreview}>Preview</MenuItem>
      </Menu>
    </div>
  )
}

export default JourneyCardMenu
