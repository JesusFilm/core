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

interface ThemeProps {
  rtl: boolean
  locale: string
  ssrMatchMedia?: (query: string) => { matches: boolean }
}

export const baseTheme = ({
  rtl,
  locale,
  ssrMatchMedia
}: ThemeProps): Pick<
  ThemeOptions,
  'spacing' | 'components' | 'breakpoints' | 'typography' | 'direction'
> => {
  const baseTypography = rtl
    ? locale === 'ur'
      ? baseTypographyUrdu
      : baseTypographyArabic
    : baseTypographyLTR

  const components =
    ssrMatchMedia != null
      ? {
          ...baseComponents.components,
          MuiUseMediaQuery: {
            defaultProps: {
              ssrMatchMedia
            }
          }
        }
      : baseComponents.components

  return {
    ...baseSpacing,
    ...baseBreakpoints,
    ...baseTypography,
    direction: rtl ? 'rtl' : 'ltr',
    components
  }
}

// DeepMerge no longer needed - remove or keep just in case for future?
export const getBaseLight = ({
  rtl,
  locale,
  ssrMatchMedia
}: ThemeProps): Theme =>
  createTheme(
    deepmerge(baseColorsLight(), baseTheme({ rtl, locale, ssrMatchMedia }))
  )

export const getBaseDark = ({
  rtl,
  locale,
  ssrMatchMedia
}: ThemeProps): Theme =>
  createTheme(
    deepmerge(baseColorsDark(), baseTheme({ rtl, locale, ssrMatchMedia }))
  )
