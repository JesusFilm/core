import Button from '@mui/material/Button'
import { ReactElement } from 'react'

export function PreviousButton({
  type,
  onClick,
  children
}: JSX.IntrinsicElements['button']): ReactElement {
  return (
    <Button variant="contained" type={type} onClick={onClick}>
      {children}
    </Button>
  )
}
