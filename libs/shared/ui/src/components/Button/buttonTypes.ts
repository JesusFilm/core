
export type IconList = 'playArrow' | 'translate' | 'checkCircle' | 'radioButtonUncheckd' | 'formatQuote' | 'lockOpen' | 'arrowForward' | 'chatBubbleOutline' | 'liveTv' | 'menuBook'

export type IconColor = 'primary' | 'secondary'

export type IconSize = 'small' | 'medium' | 'large'

export interface IconType {
  icon: IconList
  color?: IconColor
  size?: IconSize
}

export type ButtonVariant = 'contained' | 'outlined' | 'text'

export type ButtonColor = 'primary' | 'secondary'

export type ButtonSize = 'small' | 'medium' | 'large'

export type Typename = 'ButtonBlock'

export interface ButtonType {
  __typename: Typename
  label: string
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
  startIcon?: IconType
  endIcon?: IconType
}
