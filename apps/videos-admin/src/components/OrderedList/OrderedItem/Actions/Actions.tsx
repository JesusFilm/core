import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { MouseEvent, ReactElement, useState } from 'react'

import More from '@core/shared/ui/icons/More'

interface ActionsProps {
  id: string
  actions: Array<{ label: string; handler: (id: string) => void }>
}

export function Actions({ id, actions }: ActionsProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  function handleClick(e: MouseEvent<HTMLButtonElement>): void {
    setAnchorEl(e.currentTarget)
  }

  function handleAction(handler: (id: string) => void): void {
    setAnchorEl(null)
    handler(id)
  }

  return (
    <Box>
      <IconButton
        aria-label="ordered-item-actions"
        size="small"
        onClick={handleClick}
      >
        <More />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{
          'aria-labelledby': 'ordered-item-actions',
          'aria-label': 'ordered-item-actions-menu'
        }}
      >
        {actions.map(({ label, handler }) => (
          <MenuItem
            key={`${label}-action`}
            onClick={() => handleAction(handler)}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
