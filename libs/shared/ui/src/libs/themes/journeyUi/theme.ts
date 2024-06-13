import { Theme, ThemeOptions, createTheme } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'

import { journeyUiBreakpoints } from './tokens/breakpoints'
import { journeyUiColorsDark, journeyUiColorsLight } from './tokens/colors'
import { journeyUiComponents } from './tokens/components'
import { journeyUiSpacing } from './tokens/spacing'
import {
  journeyUiTypographyArabic,
  journeyUiTypography as journeyUiTypographyLTR,
  journeyUiTypographyUrdu
} from './tokens/typography'

export const journeyUiTheme = (
  rtl: boolean,
  locale: string
): Pick<
  ThemeOptions,
  'spacing' | 'components' | 'breakpoints' | 'typography' | 'direction'
> => {
  const journeyUiTypography = rtl
    ? locale === 'ur'
      ? journeyUiTypographyUrdu
      : journeyUiTypographyArabic
    : journeyUiTypographyLTR

  return {
    ...journeyUiSpacing,
    ...journeyUiComponents,
    ...journeyUiBreakpoints,
    ...journeyUiTypography,
    direction: rtl ? 'rtl' : 'ltr'
  }
}

// DeepMerge no longer needed - remove or keep just in case for future?
export const getJourneyUiLight = (rtl: boolean, locale: string): Theme =>
  createTheme(deepmerge(journeyUiColorsLight(), journeyUiTheme(rtl, locale)))

export const getJourneyUiDark = (rtl: boolean, locale: string): Theme =>
  createTheme(deepmerge(journeyUiColorsDark(), journeyUiTheme(rtl, locale)))
