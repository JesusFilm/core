import { TypographyStyle } from '@mui/material/styles'

import { THAI_FALLBACK_FONT } from '../../fonts'
import { journeyUiTypography } from '../../journeyUi/tokens/typography'

import { baseTypography, createFontFamilyString } from './typography'

function getFontFamily(
  typography: unknown,
  variant: string
): string | undefined {
  const variants = typography as Record<string, TypographyStyle>
  return variants[variant]?.fontFamily as string | undefined
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
  it('should include the Thai fallback after the Latin fonts in the top-level fontFamily', () => {
    expect(
      (baseTypography.typography as { fontFamily?: string }).fontFamily
    ).toBe(
      `Montserrat,"Open Sans",Tahoma,Verdana,${THAI_FALLBACK_FONT},sans-serif`
    )
  })

  it.each(['body1', 'body2', 'caption'])(
    'should include the Thai fallback before sans-serif in %s',
    (variant) => {
      expect(getFontFamily(baseTypography.typography, variant)).toBe(
        `"Open Sans","Tahoma","Verdana",${THAI_FALLBACK_FONT},sans-serif`
      )
    }
  )
})

describe('journeyUiTypography', () => {
  it.each(['subtitle1', 'subtitle2', 'body2', 'caption'])(
    'should include the Thai fallback after Open Sans in %s',
    (variant) => {
      expect(getFontFamily(journeyUiTypography.typography, variant)).toBe(
        `"Open Sans",${THAI_FALLBACK_FONT},sans-serif`
      )
    }
  )
})
