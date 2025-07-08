import { ThemeOptions } from '@mui/material/styles'

import { FontFamilies } from '../..'

// Update the Typography's variant prop options
declare module '@mui/material/styles' {
  interface TypographyPropsVariantOverrides {
    button: false
  }
}

export function createFontFamilyString(font: string): string {
  const fonts: string[] = []
  if (font !== '') {
    fonts.push(`"${font}"`)
  }
  fonts.push('Montserrat', '"Open Sans"', 'sans-serif')
  return fonts.join(',')
}

export const baseTypography: Pick<ThemeOptions, 'typography'> = {
  typography: {
    fontFamily: [
      'Montserrat',
      '"Open Sans"',
      'Tahoma',
      'Verdana',
      'sans-serif'
    ].join(','),
    h1: {
      fontSize: 40,
      fontWeight: 700,
      lineHeight: '50px'
    },
    h2: {
      fontSize: 36,
      fontWeight: 800,
      lineHeight: '39px'
    },
    h3: {
      fontSize: 28,
      fontWeight: 700,
      lineHeight: '34px'
    },
    h4: {
      fontSize: 22,
      fontWeight: 700,
      lineHeight: '27px'
    },
    h5: {
      fontSize: 22,
      fontWeight: 700,
      lineHeight: '22px'
    },
    h6: {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      letterSpacing: 2
    },
    subtitle1: {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      letterSpacing: 2
    },
    subtitle2: {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      letterSpacing: 2
    },
    body1: {
      fontFamily: '"Open Sans","Tahoma","Verdana",sans-serif',
      fontSize: 16,
      fontWeight: 400,
      lineHeight: '24px'
    },
    body2: {
      fontFamily: '"Open Sans","Tahoma","Verdana",sans-serif',
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '20px'
    },
    overline: {
      fontSize: 11,
      fontWeight: 600,
      lineHeight: '16px',
      letterSpacing: 3,
      marginBottom: '4px'
    },
    caption: {
      fontFamily: '"Open Sans","Tahoma","Verdana",sans-serif',
      fontSize: 12,
      fontWeight: 400,
      lineHeight: '20px'
    }
  }
}

export const createCustomTypography = (
  baseTypography: Pick<ThemeOptions, 'typography'>,
  fontFamilies?: FontFamilies
): Pick<ThemeOptions, 'typography'> => {
  const { headerFont, bodyFont, labelFont } = fontFamilies ?? {}

  const typographyOptions =
    typeof baseTypography.typography === 'function'
      ? {}
      : baseTypography.typography

  const headerFontFamily = createFontFamilyString(headerFont ?? '')
  const bodyFontFamily = createFontFamilyString(bodyFont ?? '')
  const labelFontFamily = createFontFamilyString(labelFont ?? '')

  return {
    typography: {
      ...typographyOptions,
      h1: {
        ...typographyOptions?.h1,
        fontFamily: headerFontFamily
      },
      h2: {
        ...typographyOptions?.h2,
        fontFamily: headerFontFamily
      },
      h3: {
        ...typographyOptions?.h3,
        fontFamily: headerFontFamily
      },
      h4: {
        ...typographyOptions?.h4,
        fontFamily: headerFontFamily
      },
      h5: {
        ...typographyOptions?.h5,
        fontFamily: headerFontFamily
      },
      h6: {
        ...typographyOptions?.h6,
        fontFamily: headerFontFamily
      },
      subtitle1: {
        ...typographyOptions?.subtitle1,
        fontFamily: headerFontFamily
      },
      subtitle2: {
        ...typographyOptions?.subtitle2,
        fontFamily: headerFontFamily
      },
      body1: {
        ...typographyOptions?.body1,
        fontFamily: bodyFontFamily
      },
      body2: {
        ...typographyOptions?.body2,
        fontFamily: bodyFontFamily
      },
      overline: {
        ...typographyOptions?.overline,
        fontFamily: labelFontFamily
      },
      caption: {
        ...typographyOptions?.caption,
        fontFamily: bodyFontFamily
      },
      button: {
        ...typographyOptions?.button,
        fontFamily: labelFontFamily
      }
    }
  }
}

export const baseTypographyArabic: Pick<ThemeOptions, 'typography'> = {
  typography: {
    fontFamily: ['"El Messiri","Tajawal","Arial",sans-serif'].join(','),
    h1: {
      fontSize: 36,
      fontWeight: 600,
      lineHeight: '46px'
    },
    h2: {
      fontSize: 28,
      fontWeight: 700,
      lineHeight: '38px'
    },
    h3: {
      fontSize: 24,
      fontWeight: 700,
      lineHeight: '34px'
    },
    h4: {
      fontSize: 22,
      fontWeight: 700,
      lineHeight: '32px'
    },
    h5: {
      fontSize: 18,
      fontWeight: 700,
      lineHeight: '28px'
    },
    h6: {
      fontSize: 16,
      fontWeight: 700,
      lineHeight: '24px'
    },
    subtitle1: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: '28px'
    },
    subtitle2: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: '26px'
    },
    body1: {
      fontSize: 16,
      fontWeight: 400,
      lineHeight: '26px'
    },
    body2: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '24px'
    },
    overline: {
      fontSize: 16,
      fontWeight: 700,
      lineHeight: '24px'
      // marginBottom: '4px'
    },
    caption: {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: '20px'
    }
  }
}

export const baseTypographyUrdu: Pick<ThemeOptions, 'typography'> = {
  typography: {
    fontFamily: ['"Arial",sans-serif'].join(','),
    h1: {
      fontSize: 36,
      fontWeight: 700,
      lineHeight: '46px'
    },
    h2: {
      fontSize: 28,
      fontWeight: 700,
      lineHeight: '38px'
    },
    h3: {
      fontSize: 24,
      fontWeight: 700,
      lineHeight: '34px'
    },
    h4: {
      fontSize: 22,
      fontWeight: 700,
      lineHeight: '32px'
    },
    h5: {
      fontSize: 18,
      fontWeight: 700,
      lineHeight: '28px'
    },
    h6: {
      fontSize: 16,
      fontWeight: 700,
      lineHeight: '24px'
    },
    subtitle1: {
      fontSize: 18,
      fontWeight: 700,
      lineHeight: '28px'
    },
    subtitle2: {
      fontSize: 16,
      fontWeight: 700,
      lineHeight: '26px'
    },
    body1: {
      fontSize: 16,
      fontWeight: 400,
      lineHeight: '26px'
    },
    body2: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '24px'
    },
    overline: {
      fontSize: 14,
      fontWeight: 700,
      lineHeight: '24px'
    },
    caption: {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: '20px'
    }
  }
}
