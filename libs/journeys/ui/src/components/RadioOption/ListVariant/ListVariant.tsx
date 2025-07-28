import Button, { ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import { ReactElement } from 'react'

export const StyledRadioOption = styled(Button)<ButtonProps>(({ theme }) => ({
  fontFamily: theme.typography.button.fontFamily,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: 400,
  lineHeight: theme.typography.body2.lineHeight,
  textAlign: 'start',
  justifyContent: 'flex-start',
  borderRadius: 'inherit',
  padding: '14px 10px 14px 14px'
}))

interface ListVariantProps {
  children: ReactElement | string
  selected?: boolean
  disabled?: boolean
  onClick?: (e: React.MouseEvent) => void
  startIcon?: ReactElement
  sx?: any
}

export function ListVariant({
  children,
  selected = false,
  disabled = false,
  onClick,
  startIcon,
  sx
}: ListVariantProps): ReactElement {
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
