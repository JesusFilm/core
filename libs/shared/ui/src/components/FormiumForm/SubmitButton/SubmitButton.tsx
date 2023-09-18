import Button from '@mui/material/Button'
import { ReactElement } from 'react'

export function SubmitButton(
  props: JSX.IntrinsicElements['button']
): ReactElement {
  return (
    <Button variant="contained" {...props}>
      Submit
    </Button>
  )
}
