import { ReactElement, useState } from 'react'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import IconButton from '@mui/material/IconButton'
import MoreVert from '@mui/icons-material/MoreVert'
import MuiMenu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import Edit from '@mui/icons-material/Edit'
import Share from '@mui/icons-material/Share'
import Settings from '@mui/icons-material/Settings'

interface MenuProps {
  handleDeleteBlock: () => void
}

export function Menu({ handleDeleteBlock }: MenuProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton
        id="edit-journey-actions"
        edge="end"
        aria-controls="edit-journey-actions"
        aria-haspopup="true"
        aria-expanded="true"
        onClick={handleShowMenu}
      >
        <MoreVert />
      </IconButton>
      <MuiMenu
        id="edit-journey-actions"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'edit-journey-actions'
        }}
      >
        <MenuItem>
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText>Edit Card</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteBlock}>
          <ListItemIcon>
            <DeleteOutlineRounded />
          </ListItemIcon>
          <ListItemText>Delete Card</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <Share />
          </ListItemIcon>
          <ListItemText>Social Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText>Journey Settings</ListItemText>
        </MenuItem>
      </MuiMenu>
    </>
  )
}
