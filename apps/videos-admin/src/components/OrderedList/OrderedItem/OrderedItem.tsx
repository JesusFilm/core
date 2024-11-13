import { useSortable } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { MouseEvent, ReactElement } from 'react'

import Drag from '@core/shared/ui/icons/Drag'

import { Actions } from './Actions'
import { DropDown } from './DropDown'

interface OrderedItemProps {
  id: string
  label: string
  idx: number
  total: number
  img?: { src: string; alt: string }
  onClick?: (id: string) => void
  actions?: Array<{
    label: string
    handler: (id: string) => void
  }>
  onChange?: (input: { id: string; order: number }) => void
}

export function OrderedItem({
  id,
  label,
  idx,
  total,
  img,
  onChange,
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

  function handleClick(e: MouseEvent<HTMLDivElement>): void {
    if (e.currentTarget !== e.target) return
    onClick?.(id)
  }

  return (
    <Stack
      onClick={handleClick}
      data-testid={`OrderedItem-${idx}`}
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
        data-testid={`OrderedItemDragHandle-${idx}`}
        sx={{ cursor: 'move' }}
        aria-label="ordered-item-drag-handle"
        ref={setActivatorNodeRef}
        {...listeners}
      >
        <Drag fontSize="large" />
      </IconButton>
      <Typography variant="subtitle2">{`${idx + 1}. ${label}`}</Typography>
      {onChange != null && (
        <DropDown id={id} idx={idx} total={total} onChange={onChange} />
      )}
      {img != null && (
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
      )}
      {actions != null && actions.length > 0 && (
        <Actions actions={actions} id={id} />
      )}
    </Stack>
  )
}
