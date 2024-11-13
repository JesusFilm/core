import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { MouseEvent, ReactElement, useState } from 'react'

import More from '@core/shared/ui/icons/More'

interface ItemRowMenuProps {
  actions: Array<{ label: string; handler: () => void }>
}

export function ItemRowMenu({ actions }: ItemRowMenuProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const handleClick = (e: MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(e.currentTarget)
  }

  const handleAction = (handler): void => {
    closeMenu()
    handler()
  }

  const closeMenu = (): void => {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton
        aria-label="row-item-menu-button"
        size="small"
        onClick={handleClick}
      >
        <More />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        MenuListProps={{
          'aria-labelledby': 'row-item-menu-button',
          'aria-label': 'row-item-menu'
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
    </>
  )
}
