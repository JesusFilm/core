import { ReactElement, ReactNode } from 'react'
import MuiMenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'

interface MenuItemProps {
  label: string
  icon: ReactNode
  disabled?: boolean
  onClick?: () => void
}

export function MenuItem({
  label,
  icon,
  onClick,
  disabled,
  // implicitly pass in href
  ...menuItemProps
}: MenuItemProps): ReactElement {
  return (
    <MuiMenuItem {...menuItemProps} disabled={disabled} onClick={onClick}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </MuiMenuItem>
  )
}
