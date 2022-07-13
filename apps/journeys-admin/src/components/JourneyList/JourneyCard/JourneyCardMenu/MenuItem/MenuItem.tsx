import { ReactElement } from 'react'
import MuiMenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'

interface MenuItemProps {
  icon: ReactElement
  text: string
  handleClick?: () => void
  options?
}

export function MenuItem({
  icon,
  text,
  handleClick,
  options
}: MenuItemProps): ReactElement {
  return (
    <MuiMenuItem
      sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}
      onClick={handleClick}
      {...{ ...options }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText>
        <Typography variant="body1" sx={{ pl: 2 }}>
          {text}
        </Typography>
      </ListItemText>
    </MuiMenuItem>
  )
}
