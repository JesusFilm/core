import Button from '@mui/material/Button'
import { ReactElement } from 'react'

export function PreviousButton(
  props: JSX.IntrinsicElements['button']
): ReactElement {
  return (
    <Button variant="contained" {...props}>
      Previous
    </Button>
  )
}
