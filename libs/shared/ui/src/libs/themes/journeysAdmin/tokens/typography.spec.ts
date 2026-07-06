import { TypographyStyle } from '@mui/material/styles'

import { THAI_FALLBACK_FONT } from '../../fonts'

import { adminComponents } from './components'
import { adminTypography } from './typography'

function getFontFamily(
  typography: unknown,
  variant: string
): string | undefined {
  const variants = typography as Record<string, TypographyStyle>
  return variants[variant]?.fontFamily as string | undefined
}

describe('adminTypography', () => {
  it('should include the Thai fallback after the Latin fonts in the top-level fontFamily', () => {
    expect(
      (adminTypography.typography as { fontFamily?: string }).fontFamily
    ).toBe(
      `"Montserrat", "Open Sans", "Tahoma", "Verdana", ${THAI_FALLBACK_FONT}, sans-serif`
    )
  })

  it.each(['subtitle3', 'overline2'])(
    'should include the Thai fallback before sans-serif in %s',
    (variant) => {
      expect(getFontFamily(adminTypography.typography, variant)).toBe(
        `"Montserrat", "Open Sans", "Tahoma", "Verdana", ${THAI_FALLBACK_FONT}, sans-serif`
      )
    }
  )

  it.each(['body1', 'body2', 'caption'])(
    'should include the Thai fallback before sans-serif in %s',
    (variant) => {
      expect(getFontFamily(adminTypography.typography, variant)).toBe(
        `"Open Sans", "Tahoma", "Verdana", ${THAI_FALLBACK_FONT}, sans-serif`
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
