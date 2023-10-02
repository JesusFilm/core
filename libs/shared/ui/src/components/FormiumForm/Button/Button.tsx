import MuiButton from '@mui/material/Button'
import { ComponentProps, ReactElement } from 'react'

import ArrowLeft from '../../icons/ArrowLeft'
import ArrowRight from '../../icons/ArrowRight'
import CheckBroken from '../../icons/CheckBroken'

export function Button({
  type,
  onClick,
  disabled,
  children
}: ComponentProps<'button'>): ReactElement {
  const endIcon = children === 'Submit' ? <CheckBroken /> : <ArrowRight />
  return (
    <MuiButton
      variant="contained"
      type={type}
      disabled={disabled}
      onClick={onClick}
      fullWidth
      color="secondary"
      startIcon={type === 'button' && <ArrowLeft />}
      endIcon={type === 'submit' && endIcon}
    >
      {children}
    </MuiButton>
  )
}
