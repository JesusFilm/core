import Collapse from '@mui/material/Collapse'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode, useState } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'

interface ListGroupProps {
  name: string
  icon?: ReactNode
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

  const handleClose = (): void => {
    setOpen(!open)
  }

  return (
    <>
      <ListItemButton
        onClick={handleClose}
        data-testid="ListGroupToggle"
        sx={{
          '&:hover .MuiStack-root': {
            color: 'background.paper',
            transition: (theme) => theme.transitions.create('color')
          }
        }}
      >
        <ListItemIcon sx={{ color: 'background.default' }}>{icon}</ListItemIcon>
        <ListItemText primary={name} />
        <Stack>{open ? <ChevronUpIcon /> : <ChevronDownIcon />}</Stack>
      </ListItemButton>
      <Collapse
        in={open}
        data-testid="Collapse"
        timeout="auto"
        unmountOnExit
        sx={{ pl: drawerOpen === true ? 2 : 0 }}
      >
        {children}
      </Collapse>
    </>
  )
}
