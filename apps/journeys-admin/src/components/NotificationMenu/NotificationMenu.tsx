import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import BellIcon from '@core/shared/ui/icons/Bell2'

export function NotificationMenu(): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  function notificationsLabel(count: number) {
    if (count === 0) {
      return 'no notifications'
    }
    if (count > 99) {
      return 'more than 99 notifications'
    }
    return `${count} notifications`
  }

  return (
    <>
      <IconButton aria-label={notificationsLabel(1)} onClick={handleShowMenu}>
        <Badge badgeContent={1} color="primary" overlap="circular">
          <BellIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem>
          <Typography>Notifications</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>Notifications</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>Notifications</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>Notifications</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>Notifications</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>Notifications</Typography>
        </MenuItem>
      </Menu>
    </>
  )
}
