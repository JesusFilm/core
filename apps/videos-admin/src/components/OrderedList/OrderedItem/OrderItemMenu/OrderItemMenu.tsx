import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { memo, MouseEvent, ReactElement, useMemo, useState } from 'react'

import More from '@core/shared/ui/icons/More'

import { useEdit } from '../../../../app/[locale]/(dashboard)/videos/[videoId]/_EditProvider'

interface OrderItemMenuProps {
  id: string
  actions: Array<{ label: string; handler: (id: string) => void }>
}

export const OrderItemMenu = memo(function OrderItemMenu({
  id,
  actions
}: OrderItemMenuProps): ReactElement {
  const {
    state: { isEdit }
  } = useEdit()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  function handleClick(e: MouseEvent<HTMLButtonElement>): void {
    setAnchorEl(e.currentTarget)
  }

  function handleAction(handler: (id: string) => void): void {
    setAnchorEl(null)
    handler(id)
  }

  const actionItems = useMemo(() => actions.map((action) => action), [actions])

  return (
    <Box>
      <IconButton
        disabled={!isEdit}
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
        {actionItems.map(({ label, handler }) => (
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
})
