import { useSortable } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import Drag from '@core/shared/ui/icons/Drag'

interface DraggableRowProps {
  id: string
  label: string
  img?: any
  idx: number
  count: number
  handleClick?: (id: string) => void
  handleOrderChange?: (input: { id: string; order: string | number }) => void
  actions?: Array<{
    name: string
    Icon: typeof SvgIcon
    events: { [key: string]: (id: string) => void }
    slotProps?: {
      button?: IconButtonProps
      icon?: SvgIconProps
    }
  }>
}

export function DraggableRow({
  id,
  label,
  img,
  idx,
  count,
  handleClick,
  handleOrderChange,
  actions
}: DraggableRowProps): ReactElement {
  const t = useTranslations()
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
  function clickEvent(e): void {
    if (e.currentTarget !== e.target) return

    handleClick?.(id)
  }

  const handleSelectChange = (e: SelectChangeEvent<number>): void => {
    let newOrder = e.target.value

    if (typeof newOrder === 'string') {
      newOrder = Number(newOrder)
    }

    if (typeof newOrder !== 'number' || newOrder === idx) return

    handleOrderChange?.({ id, order: newOrder })
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
        backgroundColor: 'background.default',
        p: 1,
        borderRadius: 1,
        width: '100%'
      }}
    >
      <IconButton {...listeners} sx={{ cursor: 'move' }}>
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
        <InputLabel>{t('Order')}</InputLabel>
        <Select value={idx + 1} size="small" onChange={handleSelectChange}>
          {[...Array(count)].map((_, i) => (
            <MenuItem key={i} value={i + 1}>
              <Typography>{i + 1}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {actions != null && actions.length > 0 && (
        <Stack direction="row" gap={0.75}>
          {actions.map(({ Icon, events, name, slotProps }) => (
            <IconButton
              size="small"
              {...slotProps?.button}
              key={`${name}-action`}
              aria-label={name}
              {...events}
            >
              <Icon {...slotProps?.icon} sx={{ fontSize: '16px' }} />
            </IconButton>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
