import { Theme, ThemeOptions, createTheme } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'

import { uiBreakpoints } from './tokens/breakpoints'
import { uiColorsDark, uiColorsLight } from './tokens/colors'
import { uiComponents } from './tokens/components'
import { uiSpacing } from './tokens/spacing'
import {
  uiTypographyArabic,
  uiTypography as uiTypographyLTR,
  uiTypographyUrdu
} from './tokens/typography'

export const uiTheme = (
  rtl: boolean,
  locale: string
): Pick<
  ThemeOptions,
  'spacing' | 'components' | 'breakpoints' | 'typography' | 'direction'
> => {
  const uiTypography = rtl
    ? locale === 'ur'
      ? uiTypographyUrdu
      : uiTypographyArabic
    : uiTypographyLTR

  return {
    ...uiSpacing,
    ...uiComponents,
    ...uiBreakpoints,
    ...uiTypography,
    direction: rtl ? 'rtl' : 'ltr'
  }
}

// DeepMerge no longer needed - remove or keep just in case for future?
export const getUiLight = (rtl: boolean, locale: string): Theme =>
  createTheme(deepmerge(uiColorsLight(), uiTheme(rtl, locale)))

export const getUiDark = (rtl: boolean, locale: string): Theme =>
  createTheme(deepmerge(uiColorsDark(), uiTheme(rtl, locale)))
