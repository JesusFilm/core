import Button from '@mui/material/Button'
import { ComponentProps, ReactElement } from 'react'

import CheckBrokenIcon from '../../icons/CheckBroken'

export function SubmitButton({
  type,
  onClick,
  children,
  disabled
}: ComponentProps<'button'>): ReactElement {
  return (
    <Button
      variant="contained"
      type={type}
      disabled={disabled}
      onClick={onClick}
      fullWidth
      color="secondary"
      endIcon={<CheckBrokenIcon />}
      sx={{ py: 3.25, borderRadius: '12px' }}
    >
      {children}
    </Button>
  )
}
