import Button from '@mui/material/Button'
import { ReactElement } from 'react'

export function NextButton(
  props: JSX.IntrinsicElements['button']
): ReactElement {
  return (
    <Button variant="contained" {...props}>
      Next
    </Button>
  )
}
