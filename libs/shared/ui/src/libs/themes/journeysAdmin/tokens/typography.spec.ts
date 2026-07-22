import { ThemeOptions } from '@mui/material/styles'

import { THAI_FALLBACK_FONT } from '../../fonts'

import { adminComponents } from './components'
import { adminTypography } from './typography'

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

describe('adminTypography', () => {
  it('should place the Thai fallback after the Latin webfonts and before Tahoma in the top-level fontFamily', () => {
    expect(
      (adminTypography.typography as { fontFamily?: string }).fontFamily
    ).toBe(
      `"Montserrat", "Open Sans", ${THAI_FALLBACK_FONT}, "Tahoma", "Verdana", sans-serif`
    )
  })

  it.each(['subtitle3', 'overline2'])(
    'should place the Thai fallback before Tahoma in %s',
    (variant) => {
      expect(getFontFamily(adminTypography, variant)).toBe(
        `"Montserrat", "Open Sans", ${THAI_FALLBACK_FONT}, "Tahoma", "Verdana", sans-serif`
      )
    }
  )

  it.each(['body1', 'body2', 'caption'])(
    'should place the Thai fallback before Tahoma in %s',
    (variant) => {
      expect(getFontFamily(adminTypography, variant)).toBe(
        `"Open Sans", ${THAI_FALLBACK_FONT}, "Tahoma", "Verdana", sans-serif`
      )
    }
  )
})

describe('adminComponents', () => {
  it('should include the Thai fallback in the MuiButton root font stack', () => {
    const root = adminComponents.components.MuiButton?.styleOverrides
      ?.root as Record<string, string>
    expect(root.fontFamily).toBe(
      `'Montserrat', ${THAI_FALLBACK_FONT}, sans-serif`
    )
  })

  it('should include the Thai fallback in the MuiListItemText primary font stack', () => {
    const primary = adminComponents.components.MuiListItemText?.styleOverrides
      ?.primary as Record<string, string>
    expect(primary.fontFamily).toBe(
      `'Montserrat', ${THAI_FALLBACK_FONT}, sans-serif`
    )
  })
})
