import { baseSpacing } from './spacing'

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    button: false
  }
}

export const baseTypography = {
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          marginBottom: baseSpacing.space.lg * baseSpacing.spacing
        }
      },
      variants: [
        {
          props: { variant: 'overline' as const },
          style: {
            marginBottom: baseSpacing.space.sm * baseSpacing.spacing
          }
        }
      ]
    }
  },
  typography: {
    fontFamily: [
      '"Montserrat", "Open Sans", "Tahoma", "Verdana", sans-serif'
    ].join(','),
    h1: {
      fontSize: '36px',
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
      textTransform: 'uppercase' as const
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

// Add other theme typography tokens here
