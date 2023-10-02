import MuiButton from '@mui/material/Button'
import { ComponentProps, ReactElement } from 'react'

export function Button({
  type,
  onClick,
  disabled,
  children
}: ComponentProps<'button'>): ReactElement {
  return (
    <MuiButton
      variant="contained"
      type={type}
      disabled={disabled}
      onClick={onClick}
      fullWidth
      color="secondary"
    >
      {children}
    </MuiButton>
  )
}
