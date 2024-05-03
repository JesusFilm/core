import Collapse from '@mui/material/Collapse'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode, useState } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'

interface ListGroupProps {
  name: string
  icon: ReactNode
  children: ReactNode
  drawerOpen?: boolean
}

export function ListGroup({
  name,
  icon,
  children,
  drawerOpen
}: ListGroupProps): ReactElement {
  const [open, setOpen] = useState(true)

  const handleClick = (): void => {
    setOpen(!open)
  }

  return (
    <List>
      <ListItemButton
        onClick={handleClick}
        sx={{
          '&:hover .MuiStack-root': {
            color: 'background.paper',
            transition: (theme) => theme.transitions.create('color')
          }
        }}
      >
        <ListItemIcon sx={{ color: 'background.default' }}>{icon}</ListItemIcon>
        {drawerOpen === true ? <ListItemText primary={name} /> : null}
        <Stack>{open ? <ChevronUpIcon /> : <ChevronDownIcon />}</Stack>
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List sx={{ pl: drawerOpen === true ? 2 : 0 }}>{children}</List>
      </Collapse>
    </List>
  )
}
