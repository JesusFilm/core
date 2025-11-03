import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import { ReactElement, memo } from 'react'

interface OrderedItemIconsProps {
  iconButtons: Array<{
    name: string
    Icon: typeof SvgIcon
    events: { [key: string]: (id: string) => void }
    slotProps?: {
      button?: IconButtonProps
      icon?: SvgIconProps
    }
  }>
}

export const OrderedItemIcons = memo(function OrderedItemIcons({
  iconButtons
}: OrderedItemIconsProps): ReactElement {
  return (
    <Stack direction="row" gap={0.75}>
      {iconButtons.map(({ Icon, events, name, slotProps }) => (
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
  )
})
