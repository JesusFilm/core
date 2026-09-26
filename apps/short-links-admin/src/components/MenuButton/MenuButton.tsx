import Badge, { badgeClasses } from '@mui/material/Badge'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import { ReactElement } from 'react'

export interface MenuButtonProps extends IconButtonProps {
  showBadge?: boolean
}

export function MenuButton({
  showBadge = false,
  ...props
}: MenuButtonProps): ReactElement {
  return (
    <Badge
      color="error"
      variant="dot"
      invisible={!showBadge}
      sx={{ [`& .${badgeClasses.badge}`]: { right: 2, top: 2 } }}
      data-testid="MenuButtonBadge"
    >
      <IconButton size="small" {...props} data-testid="MenuButton" />
    </Badge>
  )
}
