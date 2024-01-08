import Button from '@mui/material/Button'
import { ComponentProps, ReactElement } from 'react'

import ArrowRightIcon from '../../../icons/ArrowRight'

export function NextButton({
  type,
  onClick,
  disabled,
  children
}: ComponentProps<'button'>): ReactElement {
  return (
    <Button
      variant="contained"
      type={type}
      disabled={disabled}
      onClick={onClick}
      fullWidth
      endIcon={<ArrowRightIcon />}
    >
      {children}
    </Button>
  )
}
