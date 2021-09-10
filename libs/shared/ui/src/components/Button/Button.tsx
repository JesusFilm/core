import { ReactElement } from 'react'
import { Button as MuiButton } from '@mui/material'

export interface ButtonProps {
  label: string
}

export function Button (props: ButtonProps): ReactElement {
  return (
    <MuiButton {...props}>
        {props.label}
    </MuiButton>
  )
}
