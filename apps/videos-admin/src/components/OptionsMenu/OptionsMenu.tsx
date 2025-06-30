import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import Divider, { dividerClasses } from '@mui/material/Divider'
import { listClasses } from '@mui/material/List'
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MuiMenuItem from '@mui/material/MenuItem'
import { paperClasses } from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/navigation'
import { MouseEvent, ReactElement, useState } from 'react'

import { useLogout } from '../../libs/useLogout'
import { MenuButton } from '../MenuButton'

const MenuItem = styled(MuiMenuItem)({
  margin: '2px 0'
})

export function OptionsMenu(): ReactElement {
  const router = useRouter()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleLogout = useLogout({ onSuccess: handleClose })

  function handleClick(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }

  function handleClose(): void {
    setAnchorEl(null)
  }

  function handleSettingsClick(): void {
    router.push('/settings')
  }

  return (
    <>
      <MenuButton
        aria-label="Open menu"
        onClick={handleClick}
        sx={{ borderColor: 'transparent' }}
      >
        <MoreVertRoundedIcon />
      </MenuButton>
      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${listClasses.root}`]: {
            padding: '4px'
          },
          [`& .${paperClasses.root}`]: {
            minWidth: 180,
            padding: 0
          },
          [`& .${dividerClasses.root}`]: {
            margin: '4px -4px'
          }
        }}
      >
        <MenuItem onClick={handleSettingsClick}>Settings</MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            [`& .${listItemIconClasses.root}`]: {
              ml: 'auto',
              minWidth: 0
            }
          }}
        >
          <ListItemText>Sign Out</ListItemText>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </>
  )
}
