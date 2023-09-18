import Button from '@mui/material/Button'
import { ReactElement } from 'react'

export function SubmitButton({
  type,
  disabled,
  children
}: JSX.IntrinsicElements['button']): ReactElement {
  return (
    <Button variant="contained" type={type} disabled={disabled}>
      {children}
    </Button>
  )
}
