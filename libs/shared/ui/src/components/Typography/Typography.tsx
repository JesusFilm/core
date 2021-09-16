import { ReactElement } from 'react'
import { Typography as MuiTypography } from '@mui/material'

// Mocked out types for now, get from generated schema?
export type TypographyVariants =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'button'
  | 'caption'
  | 'overline'

export type TypographyColors =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'

export type TypographyAlignments = 'left' | 'center' | 'right'
export interface TypographyProps {
  content: string
  variant?: TypographyVariants
  color?: TypographyColors
  align?: TypographyAlignments
}

export function Typography(props: TypographyProps): ReactElement {
  return <MuiTypography {...props}>{props.content}</MuiTypography>
}

export default Typography
