'use client'

import { Theme, ThemeOptions, createTheme } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'

import { FontFamilies } from '..'

import { baseBreakpoints } from './tokens/breakpoints'
import { baseColorsDark, baseColorsLight } from './tokens/colors'
import { createBaseComponents } from './tokens/components'
import { baseSpacing } from './tokens/spacing'
import {
  baseTypographyArabic,
  baseTypography as baseTypographyLTR,
  baseTypographyUrdu,
  createCustomTypography
} from './tokens/typography'

export const baseTheme = (
  rtl: boolean,
  locale: string,
  fontFamilies?: FontFamilies
): Pick<
  ThemeOptions,
  'spacing' | 'components' | 'breakpoints' | 'typography' | 'direction'
> => {
  const baseTypography = rtl
    ? locale === 'ur'
      ? baseTypographyUrdu
      : baseTypographyArabic
    : createCustomTypography(baseTypographyLTR, fontFamilies)

  const baseComponents = createBaseComponents(fontFamilies)

  return {
    ...baseSpacing,
    ...baseComponents,
    ...baseBreakpoints,
    ...baseTypography,
    direction: rtl ? 'rtl' : 'ltr'
  }
}

// DeepMerge no longer needed - remove or keep just in case for future?
export const getBaseLight = (
  rtl: boolean,
  locale: string,
  fontFamilies?: FontFamilies
): Theme =>
  createTheme(
    deepmerge(baseColorsLight(), baseTheme(rtl, locale, fontFamilies))
  )

export const getBaseDark = (
  rtl: boolean,
  locale: string,
  fontFamilies?: FontFamilies
): Theme =>
  createTheme(deepmerge(baseColorsDark(), baseTheme(rtl, locale, fontFamilies)))
