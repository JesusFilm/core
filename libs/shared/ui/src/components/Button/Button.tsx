import { ReactElement } from 'react'
import { Button as MuiButton } from '@mui/material'

interface ButtonType {
  label: string
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'primary' | 'secondary'
  size?: 'large' | 'medium' | 'small'
  // Icon type string for now
  startIcon?: 'IconType'
  endIcon?: 'IconType'
}

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
