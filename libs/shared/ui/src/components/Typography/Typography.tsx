import { ReactElement } from 'react'
import {
  Typography as MuiTypography,
  TypographyProps as MuiTypographyProps
} from '@mui/material'
import { TypographyBlockProps } from './__generated__/TypographyBlockProps'

export interface TypographyProps
  extends TypographyBlockProps,
    Omit<MuiTypographyProps, 'id' | 'variant' | 'color' | 'align'> {}

export function Typography({
  variant,
  color,
  align,
  content,
  ...props
}: TypographyProps): ReactElement {
  return (
    <MuiTypography
      {...props}
      variant={variant ?? undefined}
      align={align ?? undefined}
      color={color ?? undefined}
    >
      {content}
    </MuiTypography>
  )
}

export default Typography
