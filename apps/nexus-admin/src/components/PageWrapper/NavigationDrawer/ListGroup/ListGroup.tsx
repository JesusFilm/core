import Collapse from '@mui/material/Collapse'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { ReactElement, ReactNode, useState } from 'react'

import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'

interface ListGroupProps {
  name: string
  icon: ReactNode
  children: ReactNode
}

export function ListGroup({
  name,
  icon,
  children
}: ListGroupProps): ReactElement {
  const [open, setOpen] = useState(true)

  const handleClick = (): void => {
    setOpen(!open)
  }

  return (
    <List>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon sx={{ color: 'background.default' }}>{icon}</ListItemIcon>
        <ListItemText primary={name} sx={{ color: 'background.default' }} />
        {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List sx={{ pl: 2 }}>{children}</List>
      </Collapse>
    </List>
  )
}
