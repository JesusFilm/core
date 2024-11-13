import { useSortable } from '@dnd-kit/sortable'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
// import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
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
    <div>
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
    </div>
  )
}

interface DropdownProps {
  idx: number
  total: number
  updateOrder: (input: { id: string; order: number }) => void
}

function Dropdown({ total, idx, updateOrder }: DropdownProps): ReactElement {
  const t = useTranslations()
  const { id } = useOrder()

  const handleChange = (e: SelectChangeEvent<number>): void => {
    let newOrder = e.target.value

    if (typeof newOrder === 'string') {
      newOrder = Number(newOrder)
    }

    if (typeof newOrder !== 'number') return

    updateOrder({ id, order: newOrder })
  }

  return (
    <FormControl sx={{ ml: 'auto' }}>
      <InputLabel>{t('Order')}</InputLabel>
      <Select value={idx + 1} size="small" onChange={handleChange}>
        {[...Array(total)].map((_, i) => (
          <MenuItem key={i} value={i + 1}>
            <Typography>{i + 1}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

function Label({ children }: { children: string }): ReactElement {
  return <Typography variant="subtitle2">{children}</Typography>
}

interface OrderedItemProps {
  id: string
  label: string
  idx: number
  // total: number
  // onOrderUpdate: (input: { id: string; order: number }) => void
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
  // total,
  // onOrderUpdate,
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

  // const handleClick = (e: MouseEvent<HTMLDivElement>): void => {
  //   if (e.currentTarget !== e.target) return

  //   onClick?.(id)
  // }

  return (
    <OrderedProvider value={{ id }}>
      <Stack
        // onClick={handleClick}
        data-testid="OrderedItem"
        id={id}
        ref={setNodeRef}
        {...attributes}
        {...listeners}
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
          aria-label="ordered-item-drag-handle"
          ref={setActivatorNodeRef}
        >
          <Drag fontSize="large" />
        </IconButton>
        <Label>{label}</Label>
        {/* <Dropdown idx={idx} total={total} updateOrder={onOrderUpdate} /> */}
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
        {/* {actions != null && actions.length > 0 && <Actions actions={actions} />} */}
      </Stack>
    </OrderedProvider>
  )
}

OrderedItem.Label = Label
OrderedItem.Dropdown = Dropdown
OrderedItem.Actions = Actions
