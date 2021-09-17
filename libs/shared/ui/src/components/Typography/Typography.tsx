import { ReactElement } from 'react'
import { Typography as MuiTypography } from '@mui/material'
import { TypographyBlockProps } from './__generated__/TypographyBlockProps'

export interface TypographyProps extends TypographyBlockProps {}

export function Typography({
  variant,
  color,
  align,
  ...props
}: TypographyProps): ReactElement {
  return <MuiTypography
    variant={ variant ?? undefined }
    color={color ?? undefined}
    align={ align ?? undefined }
    {...props}
  >{props.content}</MuiTypography>
}

export default Typography
