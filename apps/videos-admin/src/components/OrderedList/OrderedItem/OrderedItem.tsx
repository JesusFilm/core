import { useSortable } from '@dnd-kit/sortable'
import ImageIcon from '@mui/icons-material/Image'
import Box from '@mui/material/Box'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { MouseEvent, ReactElement, useMemo } from 'react'

import Drag from '@core/shared/ui/icons/Drag'

import { OrderedItemIcons } from './OrderedItemIcons'
import { OrderedItemMenu } from './OrderedItemMenu'

interface OrderedItemProps {
  id: string
  label: string
  subtitle?: string
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
  sx?: SxProps
}

export function OrderedItem({
  id,
  label,
  subtitle,
  idx,
  img,
  onClick,
  menuActions,
  iconButtons,
  sx
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
  const style =
    transform != null
      ? { transform: `translate3d(0px, ${transform.y}px, 0)`, transition }
      : undefined

  function handleClick(e: MouseEvent<HTMLLIElement>): void {
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
    <ListItem
      onClick={handleClick}
      data-testid={`OrderedItem-${idx}`}
      id={id}
      ref={setNodeRef}
      {...attributes}
      sx={{
        ...style,
        display: 'flex',
        flexDirection: 'row',
        gap: 3,
        alignItems: 'center',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.default',
        p: 2,
        borderRadius: 1,
        width: '100%',
        ...sx
      }}
    >
      <IconButton
        size="large"
        disableRipple
        data-testid={`OrderedItemDragHandle-${idx}`}
        sx={{
          backgroundColor: 'transparent',
          cursor: 'move',
          border: '0px',
          '&:active': { backgroundColor: 'transparent' },
          '&:hover': { backgroundColor: 'transparent' }
        }}
        aria-label="ordered-item-drag-handle"
        ref={setActivatorNodeRef}
        {...listeners}
      >
        <Drag
          fontSize="large"
          sx={{
            '&.MuiSvgIcon-root': {
              width: '30px !important',
              height: '30px !important'
            }
          }}
        />
      </IconButton>

      {img != null && (
        <Box
          sx={{
            position: 'relative',
            height: 72,
            width: { xs: 'auto', sm: 120 },
            borderRadius: 0.75,
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'background.paper'
          }}
        >
          {img.src ? (
            <Image
              src={img.src}
              alt={img.alt}
              loading="lazy"
              layout="fill"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <ImageIcon
              sx={{
                fontSize: 32,
                color: 'text.secondary'
              }}
            />
          )}
        </Box>
      )}
      <Box>
        <Typography variant="subtitle1" fontWeight="medium">{`${idx + 1}. ${label}`}</Typography>
        {subtitle != null && (
          <Typography
            variant="body2"
            color="text.secondary"
          >{`${subtitle}`}</Typography>
        )}
      </Box>
      <Stack sx={{ ml: 'auto' }} flexDirection="row">
        {iconMemoButtons != null && iconMemoButtons.length > 0 && (
          <OrderedItemIcons iconButtons={iconMemoButtons} />
        )}
        {menuActionButtons != null && menuActionButtons.length > 0 && (
          <OrderedItemMenu actions={menuActionButtons} id={id} />
        )}
      </Stack>
    </ListItem>
  )
}
