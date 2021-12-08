import { createTheme } from '@mui/material'

export const theme = createTheme({
  typography: {
    fontFamily: "'Open Sans', sans-serif",
    h1: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 600,
      fontStyle: 'normal',
      fontSize: '36px',
      lineHeight: '40px'
    },
    h2: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 800,
      fontStyle: 'normal',
      fontSize: '28px',
      lineHeight: '33px'
    },
    h3: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 800,
      fontStyle: 'normal',
      fontSize: '24px',
      lineHeight: '28px'
    },
    h4: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 800,
      fontStyle: 'normal',
      fontSize: '22px',
      lineHeight: '27px'
    },
    h5: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 800,
      fontStyle: 'normal',
      fontSize: '18px',
      lineHeight: '23 px'
    },
    h6: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 600,
      fontStyle: 'normal',
      fontSize: '14px',
      lineHeight: '20px',
      letterSpacing: '2px'
    },
    subtitle1: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 600,
      fontStyle: 'normal',
      fontSize: '18px',
      lineHeight: '24px'
    },
    subtitle2: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 600,
      fontStyle: 'normal',
      fontSize: '16px',
      lineHeight: '24   px'
    },
    body1: {
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: 600,
      fontStyle: 'normal',
      fontSize: '16px',
      lineHeight: '24px'
    },
    body2: {
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: 400,
      fontStyle: 'normal',
      fontSize: '14px',
      lineHeight: '20px'
    },
    overline: {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 600,
      fontStyle: 'normal',
      fontSize: '141x',
      lineHeight: '16px',
      letterSpacing: '3px'
    },
    caption: {
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: 400,
      fontStyle: 'normal',
      fontSize: '12px',
      lineHeight: '20px'
    },
    label: {
      fontFamily: "'Roboto Mono', sans-serif",
      fontWeight: 500,
      fontStyle: 'normal',
      fontSize: '36px',
      lineHeight: '47.48px'
    },
    'button-lg': {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700,
      fontStyle: 'normal',
      fontSize: '18px',
      lineHeight: '20px'
    },
    'button-md': {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 700,
      fontStyle: 'normal',
      fontSize: '15px',
      lineHeight: '18px'
    },
    'button-sm': {
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 600,
      fontStyle: 'normal',
      fontSize: '14px',
      lineHeight: '16px'
    }
  },
  palette: {
    background: {
      default: '#EFEFEF'
    },
    primary: {
      main: '#B62D1C'
    },
    text: {
      primary: '#30313D',
      secondary: '#6D6F81'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 'bold',
          borderRadius: '1000px'
        }
      }
    }
  }
})

declare module '@mui/material/styles' {
  interface TypographyVariants {
    label: React.CSSProperties
    'button-sm': React.CSSProperties
    'button-md': React.CSSProperties
    'button-lg': React.CSSProperties
  }

  interface TypographyVariantsOptions {
    label: React.CSSProperties
    'button-sm': React.CSSProperties
    'button-md': React.CSSProperties
    'button-lg': React.CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    label: true
    'button-sm': true
    'button-md': true
    'button-lg': true
  }
}
