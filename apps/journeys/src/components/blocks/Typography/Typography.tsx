import { ReactElement } from 'react'
import { Typography as MuiTypography } from '@mui/material'
import { TypographyFields } from '../../../../__generated__/TypographyFields'

export interface TypographyProps extends TypographyFields { }

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
      gutterBottom
    >
      {content}
    </MuiTypography>
  )
}

export default Typography
