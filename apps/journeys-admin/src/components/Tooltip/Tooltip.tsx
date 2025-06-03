import { styled } from '@mui/material/styles'
import MuiTooltip, {
  TooltipProps as MuiTooltipProps,
  tooltipClasses
} from '@mui/material/Tooltip'
import { ReactElement } from 'react'

import { ARROW_OFFSET } from './constants'

const StyledTooltip = styled(({ className, ...props }: MuiTooltipProps) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: '8px',
    backgroundColor: theme.palette.secondary.dark,
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '12px',
    textAlign: 'center'
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.secondary.dark
  },
  // Reset margins so the offset will start from the edge of the anchor
  [`&.${tooltipClasses.popper}[data-popper-placement*="bottom"] .${tooltipClasses.tooltip}`]:
    {
      marginTop: '0px'
    },
  [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
    {
      marginBottom: '0px'
    }
}))

interface TooltipProps
  extends Pick<
    MuiTooltipProps,
    'title' | 'open' | 'children' | 'onOpen' | 'onClose'
  > {
  offset?: number
  placement?: 'top' | 'bottom'
  light?: boolean
}

export function Tooltip({
  children,
  title,
  placement = 'top',
  offset = 0,
  light = false,
  ...rest
}: TooltipProps): ReactElement {
  return (
    <StyledTooltip
      {...rest}
      title={title}
      placement={placement}
      arrow
      enterTouchDelay={0}
      sx={
        light
          ? {
              '& .MuiTooltip-tooltip': {
                backgroundColor: 'white',
                color: 'text.primary',
                border: '1px solid #e0e0e0',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)'
              },
              '& .MuiTooltip-arrow': {
                color: 'white',
                filter: 'drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.3))'
              }
            }
          : undefined
      }
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, offset + ARROW_OFFSET]
              }
            }
          ]
        }
      }}
    >
      {children}
    </StyledTooltip>
  )
}
