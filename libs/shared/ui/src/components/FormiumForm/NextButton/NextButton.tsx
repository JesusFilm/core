import Button from '@mui/material/Button'
import { ComponentProps, ReactElement } from 'react'

import ArrowRightIcon from '../../icons/ArrowRight'

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
      color="secondary"
      endIcon={type === 'submit' && <ArrowRightIcon />}
      sx={{ py: 3.25, borderRadius: '12px' }}
    >
      {children}
    </Button>
  )
}
