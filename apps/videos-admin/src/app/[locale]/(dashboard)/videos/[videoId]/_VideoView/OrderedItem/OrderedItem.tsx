import { useSortable } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
// import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { MouseEvent, ReactElement, useState } from 'react'

import Drag from '@core/shared/ui/icons/Drag'
import More from '@core/shared/ui/icons/More'

import { createRequiredContext } from '../../../../../../../libs/createRequiredContext'

interface OrderedContext {
  id: string
}

const [OrderedProvider, useOrder] = createRequiredContext<OrderedContext>()

interface ActionsProps {
  actions: Array<{ label: string; handler: (id: string) => void }>
}

function Actions({ actions }: ActionsProps): ReactElement {
  const { id } = useOrder()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const handleClick = (e: MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(e.currentTarget)
  }

  const handleAction = (handler): void => {
    closeMenu()
    handler(id)
  }

  const closeMenu = (): void => {
    setAnchorEl(null)
  }

  return (
    <Box sx={{ ml: 'auto' }}>
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
        onClose={closeMenu}
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

function Label({ children }: { children: string }): ReactElement {
  return <Typography variant="subtitle2">{children}</Typography>
}

interface OrderedItemProps {
  id: string
  label: string
  idx: number
  total: number
  onOrderUpdate: (input: { id: string; order: number }) => void
  onClick?: (id: string) => void
  actions?: Array<{
    label: string
    handler: (id: string) => void
  }>
}

export function OrderedItem({
  id,
  label,
  idx,
  total,
  onOrderUpdate,
  onClick,
  actions
}: OrderedItemProps): ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef
  } = useSortable({ id })

  const style =
    transform != null
      ? { transform: `translate3d(0px, ${transform.y}px, 0)`, transition }
      : undefined

  const handleClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.currentTarget !== e.target) return

    onClick?.(id)
  }

  return (
    <OrderedProvider value={{ id }}>
      <Stack
        onClick={handleClick}
        data-testid="OrderedItem"
        id={id}
        ref={setNodeRef}
        {...attributes}
        direction="row"
        gap={2}
        sx={{
          ...style,
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.default',
          p: 1,
          borderRadius: 1,
          width: '100%'
        }}
      >
        <IconButton
          sx={{ cursor: 'move' }}
          aria-label="ordered-item-drag-handle"
          ref={setActivatorNodeRef}
          {...listeners}
        >
          <Drag fontSize="large" />
        </IconButton>
        <Label>{`${idx + 1}. ${label}`}</Label>
        {/* {img != null && (
          <Box
            sx={{
              position: 'relative',
              height: 48,
              width: { xs: 'auto', sm: 80 },
              borderRadius: 0.75,
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              loading="lazy"
              layout="fill"
              objectFit="cover"
            />
          </Box>
        )} */}
        {actions != null && actions.length > 0 && <Actions actions={actions} />}
      </Stack>
    </OrderedProvider>
  )
}

OrderedItem.Label = Label
OrderedItem.Actions = Actions
