import { deepmerge } from '@mui/utils'
import { createTheme, Theme, ThemeOptions } from '@mui/material/styles'
import { baseColorsLight, baseColorsDark } from './tokens/colors'
import { baseBreakpoints } from './tokens/breakpoints'
import { baseComponents } from './tokens/components'
import { baseSpacing } from './tokens/spacing'
import {
  baseTypography as baseTypographyLTR,
  baseTypographyArabic
} from './tokens/typography'

export const baseTheme = (
  rtl: boolean
): Pick<
  ThemeOptions,
  'spacing' | 'components' | 'breakpoints' | 'typography' | 'direction'
> => {
  const baseTypography = rtl ? baseTypographyArabic : baseTypographyLTR

  return {
    ...baseSpacing,
    ...baseComponents,
    ...baseBreakpoints,
    ...baseTypography,
    direction: rtl ? 'rtl' : 'ltr'
  }
}

// DeepMerge no longer needed - remove or keep just in case for future?
export const getBaseLight = (rtl: boolean): Theme =>
  createTheme(deepmerge(baseColorsLight(), baseTheme(rtl)))

export const getBaseDark = (rtl: boolean): Theme =>
  createTheme(deepmerge(baseColorsDark(), baseTheme(rtl)))
