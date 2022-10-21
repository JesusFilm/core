import { ThemeOptions } from '@mui/material/styles'

// Update the Typography's variant prop options
declare module '@mui/material' {
  interface TypographyPropsVariantOverrides {
    button: false
  }
}

export const baseTypography: Pick<ThemeOptions, 'typography'> = {
  typography: {
    fontFamily: ['"Montserrat","Open Sans","Tahoma","Verdana",sans-serif'].join(
      ','
    ),
    h1: {
      fontSize: 36,
      fontWeight: 600,
      lineHeight: '38px',
      textShadow: '0px 1px 3px rgba(0, 0, 0, 0.25)'
    },
    h2: {
      fontSize: 28,
      fontWeight: 800,
      lineHeight: '33px'
    },
    h3: {
      fontSize: 24,
      fontWeight: 800,
      lineHeight: '28px'
    },
    h4: {
      fontSize: 22,
      fontWeight: 800,
      lineHeight: '27px'
    },
    h5: {
      fontSize: 18,
      fontWeight: 800,
      lineHeight: '23px'
    },
    h6: {
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '20px',
      letterSpacing: 2,
      textTransform: 'uppercase'
    },
    subtitle1: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: '24px',
      letterSpacing: 0.5
    },
    subtitle2: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: '24px',
      letterSpacing: 0.5
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
      fontSize: 20,
      fontWeight: 600,
      lineHeight: '30px'
    },
    subtitle2: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: '24px'
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
      fontWeight: 600,
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
    fontFamily: ['"Noto Nastaliq Urdu","Arial",sans-serif'].join(','),
    h1: {
      fontSize: 32,
      fontWeight: 600,
      lineHeight: '70px'
    },
    h2: {
      fontSize: 28,
      fontWeight: 700,
      lineHeight: '64px'
    },
    h3: {
      fontSize: 24,
      fontWeight: 700,
      lineHeight: '56px'
    },
    h4: {
      fontSize: 22,
      fontWeight: 700,
      lineHeight: '54px'
    },
    h5: {
      fontSize: 18,
      fontWeight: 700,
      lineHeight: '44px'
    },
    h6: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: '38px'
    },
    subtitle1: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: '48px'
    },
    subtitle2: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: '38px'
    },
    body1: {
      fontSize: 16,
      fontWeight: 400,
      lineHeight: '44px'
    },
    body2: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '40px'
    },
    overline: {
      fontSize: 14,
      fontWeight: 700,
      lineHeight: '38px'
    },
    caption: {
      fontSize: 12,
      fontWeight: 400,
      lineHeight: '28px'
    }
  }
}
