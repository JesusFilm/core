import { useSortable } from '@dnd-kit/sortable'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ComponentPropsWithoutRef, MouseEvent, ReactElement } from 'react'

import Drag from '@core/shared/ui/icons/Drag'

import { ItemRowMenu } from '../ItemRow/ItemRowMenu'
import { OrderSelect } from '../Order/OrderSelect'

function Label({ children }: { children: string }): ReactElement {
  return <Typography variant="subtitle2">{children}</Typography>
}

interface OrderedItemProps {
  id: string
  label: string
  idx: number
  total: number
  onUpdate: (update: { id: string; newOrder: number; oldOrder: number }) => void
  onClick?: (id: string) => void
  actions?: ComponentPropsWithoutRef<typeof ItemRowMenu>['actions']
}

export function OrderedItem({
  id,
  label,
  idx,
  total,
  onUpdate,
  onClick,
  actions
}: OrderedItemProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style =
    transform != null
      ? { transform: `translate3d(0px, ${transform.y}px, 0)`, transition }
      : undefined

  const handleClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.currentTarget !== e.target) return

    onClick?.(id)
  }

  const handleOrderUpdate = (newOrder: number): void => {
    onUpdate({ id, newOrder: newOrder - 1, oldOrder: idx })
  }

  return (
    <Stack
      onClick={handleClick}
      data-testid="OrderedItem"
      id={`ordered-item-${id}`}
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
      <IconButton {...listeners} aria-label="ordered-item-drag-handle">
        <Drag fontSize="large" />
      </IconButton>
      <Label>{label}</Label>
      <Stack flexDirection="row" gap={1} sx={{ ml: 'auto' }}>
        <OrderSelect
          idx={idx}
          total={total}
          onUpdate={handleOrderUpdate}
          slotProps={{ formControl: { sx: { ml: 'auto' } } }}
        />
        {actions != null && actions.length > 0 && (
          <ItemRowMenu actions={actions} />
        )}
      </Stack>
    </Stack>
  )
}
