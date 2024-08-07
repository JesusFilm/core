import { styled } from '@mui/material/styles'
import MuiTooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { ReactElement } from 'react'

const StyledTooltip = styled(({ className, ...props}: TooltipProps) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
        padding: '8px',
        backgroundColor: '#26262e',
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '12px',
        textAlign: 'center',
  },
  [`& .${tooltipClasses.arrow}`]: {
        color: '#26262e'
  }
}))

export function Tooltip({ children, ...rest }: TooltipProps): ReactElement {
  return <StyledTooltip
  {...rest}
  >
    {children}
  </StyledTooltip>
}