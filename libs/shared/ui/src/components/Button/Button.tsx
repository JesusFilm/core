import { ReactElement } from 'react'
import { Button as MuiButton } from '@mui/material'

export type ButtonVariant = 'contained' | 'outlined' | 'text'

export type ButtonColor = 'primary' | 'secondary'

export type ButtonSize = 'large' | 'medium' | 'small'

export interface ButtonType {
  label: string
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
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
