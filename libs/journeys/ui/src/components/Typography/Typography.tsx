import { SxProps, Theme } from '@mui/material/styles'
import MuiTypography from '@mui/material/Typography'
import { ReactElement } from 'react'

import type { TreeBlock } from '../../libs/block'
import { useGetValueFromJourneyCustomizationString } from '../../libs/useGetValueFromJourneyCustomizationString'

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
  const resolvedContent = useGetValueFromJourneyCustomizationString(content)

  let displayContent: ReactElement | string = resolvedContent

  if (editableContent != null) {
    displayContent = editableContent
  } else if (content === '' && placeholderText != null) {
    displayContent = placeholderText
  }

  // MUI's Typography `color` prop only understands palette names (primary,
  // secondary, error...). A hex color from settings, or a palette path like
  // text.disabled, has to go through `sx` or it is silently dropped.
  function getCustomColor(): string | undefined {
    if (content === '') return 'text.disabled'
    if (settings?.color != null && settings.color !== '') return settings.color
    return undefined
  }

  const customColor = getCustomColor()
  const paletteColor = customColor == null ? (color ?? undefined) : undefined
  const sx: SxProps<Theme> = {
    color: customColor,
    whiteSpace: 'pre-line',
    wordBreak: 'break-word'
  }

  return (
    <>
      {variant === 'overline' || variant === 'caption' ? (
        <MuiTypography
          variant={variant ?? undefined}
          align={align ?? undefined}
          color={paletteColor}
          component="p"
          gutterBottom
          data-testid="JourneysTypography"
          sx={sx}
        >
          {displayContent}
        </MuiTypography>
      ) : (
        <MuiTypography
          variant={variant ?? undefined}
          align={align ?? undefined}
          color={paletteColor}
          gutterBottom
          data-testid="JourneysTypography"
          sx={sx}
        >
          {displayContent}
        </MuiTypography>
      )}
    </>
  )
}
