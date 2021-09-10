
export type IconList = 'playArrow' | 'translate' | 'checkCircle' | 'radioButtonUncheckd' | 'formatQuote' | 'lockOpen' | 'arrowForward' | 'chatBubbleOutline' | 'liveTv' | 'menuBook'

export type ColorType = 'primary' | 'secondary'

export type SizeType = 'large' | 'medium' | 'small'

export interface IconType {
  icon: IconList
  color?: ColorType
  size?: SizeType
}

export type ButtonVariant = 'contained' | 'outlined' | 'text'

export interface ButtonType {
  label: string
  variant?: ButtonVariant
  color?: ColorType
  size?: SizeType
  startIcon?: IconType
  endIcon?: IconType
}
