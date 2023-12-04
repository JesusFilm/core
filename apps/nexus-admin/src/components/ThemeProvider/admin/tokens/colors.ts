import { ThemeOptions } from '@mui/material/styles'

export const palette = {
  error: '#B62D1C',
  success: '#3AA74A',
  warning: '#F0720C',
  900: '#26262E',
  800: '#444451',
  700: '#6D6D7D',
  200: '#DEDFE0',
  100: '#EFEFEF',
  0: '#FFFFFF'
}

export const adminColorsLight: Required<Pick<ThemeOptions, 'palette'>> = {
  palette: {
    mode: 'light',
    background: { default: '#EFEFEF', paper: '#FFFFFF' },
    primary: {
      light: '#E43343',
      main: '#C52D3A',
      dark: '#9E2630',
      contrastText: palette[0]
    },
    secondary: {
      light: palette[700],
      main: palette[800],
      dark: palette[900],
      contrastText: palette[0]
    },
    error: { main: palette.error, contrastText: palette[0] },
    success: { main: palette.success, contrastText: palette[0] },
    warning: { main: palette.warning, contrastText: palette[0] },
    text: {
      primary: palette[800],
      secondary: palette[700]
    },
    divider: palette[200]
  }
}
