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
  settings,
  editableContent,
  placeholderText
}: TypographyProps): ReactElement {
  let displayContent: ReactElement | string = content

  if (editableContent != null) {
    displayContent = editableContent
  } else if (content === '' && placeholderText != null) {
    displayContent = placeholderText
  }

  // Use settings.color if available, otherwise fall back to enum color
  const getTextColor = () => {
    if (content === '') return 'text.disabled'
    if (settings?.color != null && settings.color !== '') return settings.color
    return color ?? undefined
  }

  const textColor = getTextColor()

  return (
    <>
      {variant === 'overline' || variant === 'caption' ? (
        <MuiTypography
          variant={variant ?? undefined}
          align={align ?? undefined}
          color={textColor}
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
          color={textColor}
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
