import MuiTypography from '@mui/material/Typography'
import { ElementType, ReactElement } from 'react'

import type { TreeBlock } from '../../libs/block'

import { TypographyFields } from './__generated__/TypographyFields'

export interface TypographyProps extends TreeBlock<TypographyFields> {
  editableContent?: ReactElement
  placeholderText?: string
}

export function Typography({
  variant,
  color,
  align,
  content,
  editableContent,
  placeholderText
}: TypographyProps): ReactElement {
  let displayContent: ReactElement | string = content

  if (editableContent != null) {
    displayContent = editableContent
  } else if (content === '' && placeholderText != null) {
    displayContent = placeholderText
  }

  return (
    <MuiTypography
      variant={variant ?? undefined}
      align={align ?? undefined}
      color={content === '' ? 'text.disabled' : color ?? undefined}
      component={
        variant === 'overline' || variant === 'caption'
          ? 'p'
          : (variant as ElementType) ?? 'p'
      }
      gutterBottom
      whiteSpace="pre-line"
      data-testid="JourneysTypography"
    >
      {displayContent}
    </MuiTypography>
  )
}
