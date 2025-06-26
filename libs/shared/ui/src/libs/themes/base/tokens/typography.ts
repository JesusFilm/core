import { ThemeOptions } from '@mui/material/styles'

import { FontFamilies } from '../theme'

// Update the Typography's variant prop options
declare module '@mui/material/styles' {
  interface TypographyPropsVariantOverrides {
    button: false
  }
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
      lineHeight: '50px',
      textShadow: '0px 1px 3px rgba(0, 0, 0, 0.25)'
    },
    h2: {
      fontSize: 32,
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

// Create a custom typography configuration based on fontFamilies
export const createCustomTypography = (
  baseTypography: Pick<ThemeOptions, 'typography'>,
  fontFamilies?: FontFamilies
): Pick<ThemeOptions, 'typography'> => {
  const { primaryFontFamily, secondaryFontFamily } = fontFamilies ?? {}

  const typographyOptions =
    typeof baseTypography.typography === 'function'
      ? {}
      : baseTypography.typography

  return {
    typography: {
      ...typographyOptions,
      h1: {
        ...typographyOptions?.h1,
        fontFamily: [
          `"${primaryFontFamily}"`,
          'Montserrat',
          '"Open Sans"',
          'sans-serif'
        ].join(',')
      },
      h2: {
        ...typographyOptions?.h2,
        fontFamily: [
          `"${primaryFontFamily}"`,
          'Montserrat',
          '"Open Sans"',
          'sans-serif'
        ].join(',')
      },
      h3: {
        ...typographyOptions?.h3,
        fontFamily: [
          `"${primaryFontFamily}"`,
          'Montserrat',
          '"Open Sans"',
          'sans-serif'
        ].join(',')
      },
      h4: {
        ...typographyOptions?.h4,
        fontFamily: [
          `"${primaryFontFamily}"`,
          'Montserrat',
          '"Open Sans"',
          'sans-serif'
        ].join(',')
      },
      h5: {
        ...typographyOptions?.h5,
        fontFamily: [
          `"${primaryFontFamily}"`,
          'Montserrat',
          '"Open Sans"',
          'sans-serif'
        ].join(',')
      },
      h6: {
        ...typographyOptions?.h6,
        fontFamily: [
          `"${primaryFontFamily}"`,
          'Montserrat',
          '"Open Sans"',
          'sans-serif'
        ].join(',')
      },
      subtitle1: {
        ...typographyOptions?.subtitle1,
        fontFamily: [
          `"${primaryFontFamily}"`,
          'Montserrat',
          '"Open Sans"',
          'sans-serif'
        ].join(',')
      },
      subtitle2: {
        ...typographyOptions?.subtitle2,
        fontFamily: [
          `"${primaryFontFamily}"`,
          'Montserrat',
          '"Open Sans"',
          'sans-serif'
        ].join(',')
      },
      body1: {
        ...typographyOptions?.body1,
        fontFamily: [
          `"${secondaryFontFamily}"`,
          'Montserrat',
          '"Open Sans"',
          'sans-serif'
        ].join(',')
      },
      body2: {
        ...typographyOptions?.body2,
        fontFamily: [
          `"${secondaryFontFamily}"`,
          'Montserrat',
          '"Open Sans"',
          'sans-serif'
        ].join(',')
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
