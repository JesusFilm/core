import MuiTypography from '@mui/material/Typography'
import { ReactElement } from 'react'

import type { TreeBlock } from '../../libs/block'

import { TypographyFields } from './__generated__/TypographyFields'

export interface TypographyProps extends TreeBlock<TypographyFields> {
  editableContent?: ReactElement
}

export function Typography({
  variant,
  color,
  align,
  content,
  editableContent
}: TypographyProps): ReactElement {
  return (
    <MuiTypography
      variant={variant ?? undefined}
      align={align ?? undefined}
      color={color ?? undefined}
      paragraph={variant === 'overline' || variant === 'caption'}
      gutterBottom
      whiteSpace="pre-line"
    >
      {editableContent ?? content}
    </MuiTypography>
  )
}
