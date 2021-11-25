import { ReactElement, useState } from 'react'
import { IconButton, Menu, MenuItem, Divider } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
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

  const handleEdit = (): void => {
    // trigger LinkAction to Edit Card page Tatai makes=
  }
  const handleChangeAccess = (): void => {
    // trigger the change access modal that John / Gavin build
  }
  const handlePreview = (): void => {
    // tirgger link action to journey preview
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
        <MenuItem onClick={handleChangeAccess}>Change Access</MenuItem>
        <Divider />
        {status === JourneyStatus.draft ? (
          <MenuItem disabled onClick={handlePreview}>
            Preview
          </MenuItem>
        ) : (
          <MenuItem onClick={handlePreview}>Preview</MenuItem>
        )}
      </Menu>
    </div>
  )
}

export default JourneyCardMenu
