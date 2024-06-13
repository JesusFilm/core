import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MuiMenuItem from '@mui/material/MenuItem'
import { ComponentProps, MouseEvent, ReactElement, ReactNode } from 'react'

interface MenuItemProps extends ComponentProps<typeof MuiMenuItem> {
  label: string
  icon: ReactNode
  disabled?: boolean
  openInNew?: boolean
  onClick?: (event: MouseEvent<HTMLElement>) => void
  testId?: string
}

export function MenuItem({
  label,
  icon,
  disabled,
  openInNew,
  onClick,
  testId,
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
      data-testid={`JourneysAdminMenuItem${testId ?? ''}`}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText>{label}</ListItemText>
    </MuiMenuItem>
  )
}
