import { ThemeOptions } from '@mui/material/styles'

// Update the Typography's variant prop options
declare module '@mui/material' {
  interface TypographyPropsVariantOverrides {
    button: false
  }
}

export const adminTypography: Pick<ThemeOptions, 'typography'> = {
  typography: {
    fontFamily: [
      '"Montserrat", "Open Sans", "Tahoma", "Verdana", sans-serif'
    ].join(','),
    h1: {
      fontWeight: 600,
      fontSize: 36,
      lineHeight: '40px'
    },
    h2: {
      fontWeight: 800,
      fontSize: 28,
      lineHeight: '33px'
    },
    h3: {
      fontWeight: 800,
      fontSize: 24,
      lineHeight: '28px'
    },
    h4: {
      fontWeight: 800,
      fontSize: 22,
      lineHeight: '27px'
    },
    h5: {
      fontSize: 18,
      fontWeight: 800,
      lineHeight: '23px',
      textTransform: 'none',
      letterSpacing: 0
    },
    h6: {
      fontSize: 20,
      fontWeight: 700,
      lineHeight: '23px',
      letterSpacing: 0,
      textTransform: 'none'
    },
    subtitle1: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: '24px',
      letterSpacing: 1
    },
    subtitle2: {
      fontSize: 16,
      fontWeight: 600,
      lineHeight: '24px'
    },
    body1: {
      fontFamily: '"Open Sans", "Tahoma", "Verdana", sans-serif',
      fontSize: 16,
      fontWeight: 400,
      lineHeight: '24px'
    },
    body2: {
      fontFamily: '"Open Sans", "Tahoma", "Verdana", sans-serif',
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '20px'
    },
    overline: {
      fontSize: 11,
      fontWeight: 600,
      lineHeight: '16px',
      letterSpacing: 3
    },
    caption: {
      fontFamily: '"Open Sans", "Tahoma", "Verdana", sans-serif',
      fontSize: 12,
      fontWeight: 400,
      lineHeight: '20px'
    }
  }
}
