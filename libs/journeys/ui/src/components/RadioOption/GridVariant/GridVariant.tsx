import Button, { ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import { ReactElement } from 'react'

const StyledRadioOption = styled(Button)<ButtonProps>(({ theme }) => ({
  fontFamily: theme.typography.button.fontFamily,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: 400,
  lineHeight: theme.typography.body2.lineHeight,
  textAlign: 'start',
  justifyContent: 'flex-start',
  borderRadius: 'inherit',
  padding: '14px 10px 14px 14px',
  height: '100%',
  minHeight: '80px'
}))

interface GridVariantProps {
  children: ReactElement | string
  selected?: boolean
  disabled?: boolean
  onClick?: (e: React.MouseEvent) => void
  startIcon?: ReactElement
  sx?: any
}

export function GridVariant({
  children,
  selected = false,
  disabled = false,
  onClick,
  startIcon,
  sx
}: GridVariantProps): ReactElement {
  return (
    <StyledRadioOption
      variant="contained"
      disabled={disabled}
      onClick={onClick}
      fullWidth
      disableRipple
      startIcon={startIcon}
      sx={sx}
      data-testid="JourneysRadioOption"
    >
      {children}
    </StyledRadioOption>
  )
}
