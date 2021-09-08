import { createTheme } from '@mui/material'

const baseTheme = createTheme({
  typography: {
    fontFamily: ['"Noto Sans"'].join(','),
    h1: {
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 1.14
    },
    h6: {
      fontSize: 13,
      fontWeight: 400,
      lineHeight: 1.4
    }
  },
  shape: {
    borderRadius: 8
  }
})

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
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

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5'
    },
    secondary: {
      main: '#f500057'
    }
  }
})
