import { ReactElement } from 'react'
import { Typography as MuiTypography } from '@mui/material'
import { TreeBlock } from '../..'
import { TypographyFields } from './__generated__/TypographyFields'

export function Typography({
  variant,
  color,
  align,
  content
}: TreeBlock<TypographyFields>): ReactElement {
  return (
    <MuiTypography
      variant={variant ?? undefined}
      align={align ?? undefined}
      color={color ?? undefined}
      paragraph={variant === 'overline' || variant === 'caption'}
      gutterBottom
    >
      {content}
    </MuiTypography>
  )
}

export default Typography
