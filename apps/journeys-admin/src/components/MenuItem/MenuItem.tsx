import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MuiMenuItem from '@mui/material/MenuItem'
import { ReactElement, ReactNode } from 'react'

interface MenuItemProps {
  label: string
  icon: ReactNode
  disabled?: boolean
  openInNew?: boolean
  onClick?: () => void
}

export function MenuItem({
  label,
  icon,
  disabled,
  openInNew,
  onClick,
  // implicitly pass in href
  ...menuItemProps
}: MenuItemProps): ReactElement {
  const newTabProps =
    openInNew === true
      ? // TODO: Doesn't redirect to new page if menuitem element bug
        { target: '_blank', rel: 'noopener', component: 'a' }
      : {}
  return (
    <MuiMenuItem
      {...menuItemProps}
      {...newTabProps}
      disabled={disabled}
      onClick={onClick}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </MuiMenuItem>
  )
}
