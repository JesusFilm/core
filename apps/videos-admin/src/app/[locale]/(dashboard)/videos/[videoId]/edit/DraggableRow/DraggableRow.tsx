import { useSortable } from '@dnd-kit/sortable'
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography
} from '@mui/material'
import Image from 'next/image'
import { ReactElement } from 'react'

import Drag from '@core/shared/ui/icons/Drag'
import Trash2 from '@core/shared/ui/icons/Trash2'

interface DraggableRowProps {
  id: string
  label: string
  img?: any
  idx: number
  count: number
  handleClick?: () => void
}

export function DraggableRow({
  id,
  label,
  img,
  idx,
  count,
  handleClick
}: DraggableRowProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style =
    transform != null
      ? { transform: `translate3d(0px, ${transform.y}px, 0)`, transition }
      : undefined

  // const handleNavigate = (): void => {
  //   if (pathname == null) return

  //   const [, locale, entity] = pathname.split('/')

  //   router.push(`/${locale}/${entity}/${id}`)
  // }

  const clickEvent = (e): void => {
    if (e.currentTarget !== e.target) return

    handleClick?.()
  }

  return (
    <Stack
      onClick={clickEvent}
      id={`draggable-row-${id}`}
      ref={setNodeRef}
      {...attributes}
      direction="row"
      gap={2}
      sx={{
        ...style,
        alignItems: 'center',
        border: '1px solid',
        borderColor: 'divider',
        p: 1,
        borderRadius: 1,
        width: '1000px'
      }}
    >
      <IconButton {...listeners}>
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
      <Typography variant="subtitle2">{label}</Typography>
      <FormControl sx={{ ml: 'auto' }}>
        <InputLabel>Order</InputLabel>
        <Select value={idx + 1} size="small">
          {[...Array(count)].map((_, i) => (
            <MenuItem key={i} value={i + 1}>
              <Typography>{i + 1}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <IconButton aria-label="delete" color="error" size="small">
        <Trash2 sx={{ fontSize: '16px' }} color="error" />
      </IconButton>
    </Stack>
  )
}
