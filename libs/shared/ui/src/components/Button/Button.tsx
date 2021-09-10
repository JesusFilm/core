import { ReactElement } from 'react'
import { Button as MuiButton } from '@mui/material'
import { ButtonType } from './buttonTypes'

export interface ButtonProps extends ButtonType {
  loading?: boolean
  disabled?: boolean
}

export function Button (props: ButtonProps): ReactElement {
  return (
    <MuiButton {...props}>
        {props.label}
    </MuiButton>
  )
}
