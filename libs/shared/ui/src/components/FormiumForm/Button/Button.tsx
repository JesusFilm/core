import MuiButton from '@mui/material/Button'
import { ComponentProps, ReactElement } from 'react'

import ArrowLeftIcon from '../../icons/ArrowLeft'
import ArrowRightIcon from '../../icons/ArrowRight'

export function Button({
  type,
  onClick,
  disabled,
  children
}: ComponentProps<'button'>): ReactElement {
  return (
    <MuiButton
      variant={type === 'button' ? 'outlined' : 'contained'}
      type={type}
      disabled={disabled}
      onClick={onClick}
      fullWidth
      color="secondary"
      startIcon={type === 'button' && <ArrowLeftIcon />}
      endIcon={type === 'submit' && <ArrowRightIcon />}
    >
      {children}
    </MuiButton>
  )
}
