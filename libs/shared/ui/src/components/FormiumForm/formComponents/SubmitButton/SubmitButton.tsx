import Button from '@mui/material/Button'
import { ComponentProps, ReactElement } from 'react'

import CheckBrokenIcon from '../../../icons/CheckBroken'
import { useFormium } from '../../FormiumProvider'

export function SubmitButton({
  type,
  onClick,
  children,
  disabled
}: ComponentProps<'button'>): ReactElement {
  const { submitText, submitIcon } = useFormium()

  return (
    <Button
      variant="contained"
      type={type}
      disabled={disabled}
      onClick={onClick}
      fullWidth
      color="secondary"
      endIcon={submitIcon ?? <CheckBrokenIcon />}
      sx={{ py: 3.25, borderRadius: '12px' }}
    >
      {submitText ?? children}
    </Button>
  )
}
