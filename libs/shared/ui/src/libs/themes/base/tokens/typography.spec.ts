import { ThemeOptions } from '@mui/material/styles'

import { THAI_FALLBACK_FONT } from '../../fonts'
import { journeyUiTypography } from '../../journeyUi/tokens/typography'

import { baseTypography, createFontFamilyString } from './typography'

type TypographyTokens = Pick<ThemeOptions, 'typography'>

function getFontFamily(
  tokens: TypographyTokens,
  variant: string
): string | undefined {
  const variants = tokens.typography as Record<
    string,
    { fontFamily?: string } | undefined
  >
  return variants[variant]?.fontFamily
}

describe('createFontFamilyString', () => {
  it('should place the custom font first and the Thai fallback after the Latin fonts', () => {
    expect(createFontFamilyString('Custom')).toBe(
      `"Custom",Montserrat,"Open Sans",${THAI_FALLBACK_FONT},sans-serif`
    )
  })

  it('should omit the leading entry when no font is provided', () => {
    expect(createFontFamilyString('')).toBe(
      `Montserrat,"Open Sans",${THAI_FALLBACK_FONT},sans-serif`
    )
  })
})

describe('baseTypography', () => {
  it('should place the Thai fallback after the Latin webfonts and before Tahoma in the top-level fontFamily', () => {
    expect(
      (baseTypography.typography as { fontFamily?: string }).fontFamily
    ).toBe(
      `Montserrat,"Open Sans",${THAI_FALLBACK_FONT},Tahoma,Verdana,sans-serif`
    )
  })

  it.each(['body1', 'body2', 'caption'])(
    'should place the Thai fallback before Tahoma in %s',
    (variant) => {
      expect(getFontFamily(baseTypography, variant)).toBe(
        `"Open Sans",${THAI_FALLBACK_FONT},"Tahoma","Verdana",sans-serif`
      )
    }
  )
})

describe('journeyUiTypography', () => {
  it.each(['subtitle1', 'subtitle2', 'body2', 'caption'])(
    'should include the Thai fallback after Open Sans in %s',
    (variant) => {
      expect(getFontFamily(journeyUiTypography, variant)).toBe(
        `"Open Sans",${THAI_FALLBACK_FONT},sans-serif`
      )
    }
  )
})
