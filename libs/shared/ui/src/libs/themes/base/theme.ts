import { Theme, ThemeOptions, createTheme } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'

import { baseBreakpoints } from './tokens/breakpoints'
import { baseColorsDark, baseColorsLight } from './tokens/colors'
import { baseComponents } from './tokens/components'
import { baseSpacing } from './tokens/spacing'
import {
  baseTypographyArabic,
  baseTypography as baseTypographyLTR,
  baseTypographyUrdu
} from './tokens/typography'

export const baseTheme = (
  rtl: boolean,
  locale: string
): Pick<
  ThemeOptions,
  'spacing' | 'components' | 'breakpoints' | 'typography' | 'direction'
> => {
  const baseTypography = rtl
    ? locale === 'ur'
      ? baseTypographyUrdu
      : baseTypographyArabic
    : baseTypographyLTR

  return {
    ...baseSpacing,
    ...baseComponents,
    ...baseBreakpoints,
    ...baseTypography,
    direction: rtl ? 'rtl' : 'ltr'
  }
}

// DeepMerge no longer needed - remove or keep just in case for future?
export const getBaseLight = (rtl: boolean, locale: string): Theme =>
  createTheme(deepmerge(baseColorsLight(), baseTheme(rtl, locale)))

export const getBaseDark = (rtl: boolean, locale: string): Theme =>
  createTheme(deepmerge(baseColorsDark(), baseTheme(rtl, locale)))
