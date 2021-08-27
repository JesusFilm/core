import { createTheme } from '@material-ui/core'

const baseTheme = createTheme({
  typography: {
    fontFamily: ['"Noto Sans"'].join(','),
    h1: {
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 1.14
    },
    subtitle1: {
      fontSize: 13,
      fontWeight: 400,
      lineHeight: 1.4
    }
  },
  shape: {
    borderRadius: 8
  }
})

const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    type: 'light',
    primary: {
      main: '#fcba03'
    },
    secondary: {
      main: '#f50057'
    },
    success: {
      main: '#54A055'
    }
  }
})

const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    type: 'dark',
    primary: {
      main: '#3f51b5'
    },
    secondary: {
      main: '#f500057'
    }
  }
})

export default {
  lightTheme,
  darkTheme
}
