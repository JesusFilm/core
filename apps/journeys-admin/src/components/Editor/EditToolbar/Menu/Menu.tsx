import { ReactElement, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import MoreVert from '@mui/icons-material/MoreVert'
import MuiMenu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { useEditor } from '@core/journeys/ui'
import { DeleteBlock } from '../DeleteBlock'

export function Menu(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  function BlockMenu(): ReactElement {
    return (
      <>
        <MenuItem>
          <ListItemIcon>
            <EditRoundedIcon />
          </ListItemIcon>
          <ListItemText>Edit Block</ListItemText>
        </MenuItem>
        <Divider />
        <DeleteBlock variant="list-item" />
      </>
    )
  }

  function CardMenu(): ReactElement {
    return (
      <>
        <MenuItem>
          <ListItemIcon>
            <EditRoundedIcon />
          </ListItemIcon>
          <ListItemText>Edit Card</ListItemText>
        </MenuItem>
        <DeleteBlock variant="list-item" />
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <EditRoundedIcon />
          </ListItemIcon>
          <ListItemText>Journey Settings</ListItemText>
        </MenuItem>
      </>
    )
  }

  return (
    <>
      <IconButton
        id="edit-journey-actions"
        edge="end"
        aria-controls="edit-journey-actions"
        aria-haspopup="true"
        aria-expanded={anchorEl != null ? 'true' : undefined}
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
        {selectedBlock?.__typename === 'StepBlock' ? (
          <CardMenu />
        ) : (
          <BlockMenu />
        )}
      </MuiMenu>
    </>
  )
}
