import MuiButton from '@mui/material/Button'
import { ComponentProps, ReactElement } from 'react'

import ArrowLeftIcon from '../../icons/ArrowLeft'
import ArrowRightIcon from '../../icons/ArrowRight'
import CheckBrokenIcon from '../../icons/CheckBroken'

export function Button({
  type,
  onClick,
  disabled,
  children
}: ComponentProps<'button'>): ReactElement {
  const endIcon =
    children === 'Submit' ? <CheckBrokenIcon /> : <ArrowRightIcon />
  return (
    <MuiButton
      variant="contained"
      type={type}
      disabled={disabled}
      onClick={onClick}
      fullWidth
      color="secondary"
      startIcon={type === 'button' && <ArrowLeftIcon />}
      endIcon={type === 'submit' && endIcon}
    >
      {children}
    </MuiButton>
  )
}
