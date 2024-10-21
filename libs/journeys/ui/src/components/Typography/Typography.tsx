import MuiTypography from '@mui/material/Typography'
import { ReactElement } from 'react'

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
    <>
      {variant === 'overline' || variant === 'caption' ? (
        <MuiTypography
          variant={variant ?? undefined}
          align={align ?? undefined}
          color={content === '' ? 'text.disabled' : (color ?? undefined)}
          component="p"
          gutterBottom
          whiteSpace="pre-line"
          data-testid="JourneysTypography"
        >
          {displayContent}
        </MuiTypography>
      ) : (
        <MuiTypography
          variant={variant ?? undefined}
          align={align ?? undefined}
          color={content === '' ? 'text.disabled' : (color ?? undefined)}
          gutterBottom
          whiteSpace="pre-line"
          data-testid="JourneysTypography"
        >
          {displayContent}
        </MuiTypography>
      )}
    </>
  )
}
