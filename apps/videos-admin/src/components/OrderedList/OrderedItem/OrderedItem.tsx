import { useSortable } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { CSSProperties, MouseEvent, ReactElement, useMemo } from 'react'

import Drag from '@core/shared/ui/icons/Drag'

import { useEdit } from '../../../app/[locale]/(dashboard)/videos/[videoId]/_EditProvider'

import { OrderedItemIcons } from './OrderedItemIcons'
import { OrderedItemMenu } from './OrderedItemMenu'

interface OrderedItemProps {
  id: string
  label: string
  idx: number
  img?: { src: string; alt: string }
  onClick?: (id: string) => void
  menuActions?: Array<{
    label: string
    handler: (id: string) => void
  }>
  iconButtons?: Array<{
    name: string
    Icon: typeof SvgIcon
    events: { [key: string]: (id: string) => void }
    slotProps?: {
      button?: IconButtonProps
      icon?: SvgIconProps
    }
  }>
  virtualStyles?: CSSProperties
}

export function OrderedItem({
  id,
  label,
  idx,
  img,
  onClick,
  menuActions,
  iconButtons,
  virtualStyles
}: OrderedItemProps): ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef
  } = useSortable({
    id,
    data: {
      index: idx
    }
  })
  const {
    state: { isEdit }
  } = useEdit()
  const style =
    transform != null
      ? { transform: `translate3d(0px, ${transform.y}px, 0)`, transition }
      : undefined

  function handleClick(e: MouseEvent<HTMLDivElement>): void {
    if (e.currentTarget !== e.target) return
    onClick?.(id)
  }

  const iconMemoButtons = useMemo(
    () => iconButtons?.map((button) => button),
    [iconButtons]
  )

  const menuActionButtons = useMemo(
    () => menuActions?.map((actions) => actions),
    [menuActions, id]
  )

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
        width: '100%',
        ...virtualStyles
      }}
    >
      <IconButton
        disabled={!isEdit}
        data-testid={`OrderedItemDragHandle-${idx}`}
        sx={{ cursor: 'move' }}
        aria-label="ordered-item-drag-handle"
        ref={setActivatorNodeRef}
        {...listeners}
      >
        <Drag fontSize="large" />
      </IconButton>
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
      <Typography variant="subtitle2">{`${idx + 1}. ${label}`}</Typography>
      <Stack sx={{ ml: 'auto' }} flexDirection="row">
        {iconMemoButtons != null && iconMemoButtons.length > 0 && isEdit && (
          <OrderedItemIcons iconButtons={iconMemoButtons} />
        )}
        {menuActionButtons != null &&
          menuActionButtons.length > 0 &&
          isEdit && <OrderedItemMenu actions={menuActionButtons} id={id} />}
      </Stack>
    </Stack>
  )
}
