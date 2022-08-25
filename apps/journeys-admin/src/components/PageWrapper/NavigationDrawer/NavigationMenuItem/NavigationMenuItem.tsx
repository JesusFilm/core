import { ReactElement } from 'react'
import Link from 'next/link'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

interface NavigationMenuItemProps {
  icon: ReactElement
  text: string
  color: string
  link: string
  handleClick?: (e?) => void
}

export function NavigationMenuItem({
  icon,
  text,
  color,
  link,
  handleClick
}: NavigationMenuItemProps): ReactElement {
  return (
    <Link href={link} passHref>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon
          sx={{
            color
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={text}
          sx={{
            color
          }}
        />
      </ListItemButton>
    </Link>
  )
}
