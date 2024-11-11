import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import { ReactElement } from 'react'

interface Action {
  handler: () => void
  Icon: typeof SvgIcon
  slotProps?: {
    iconButton?: IconButtonProps
    icon?: SvgIconProps
  }
}

interface ItemRowActionsProps {
  actions: Action[]
}

export function ItemRowActions({ actions }: ItemRowActionsProps): ReactElement {
  return (
    <Stack direction="row" gap={1} data-testid="ItemRowActions">
      {actions.map(({ handler, Icon, slotProps }, idx) => (
        <IconButton
          key={`action-${idx}`}
          {...slotProps?.iconButton}
          size="small"
          onClick={handler}
          aria-label="item-row-action"
        >
          <Icon {...slotProps?.icon} />
        </IconButton>
      ))}
    </Stack>
  )
}
