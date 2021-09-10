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
