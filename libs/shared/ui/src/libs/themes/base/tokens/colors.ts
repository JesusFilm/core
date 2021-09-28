import { ThemeOptions } from '@mui/material/styles'

export const baseColorsLight: Required<Pick<ThemeOptions, 'palette'>> = {
  palette: {
    mode: 'light',
    // DEFAULT CONTAINER COLORS
    background: { default: '#FEFEFE' },
    primary: {
      light: '#6D6F81',
      main: '#30313D',
      dark: '#26262E',
      contrastText: '#FFFFFF'
    },
    // OVERRIDE COLORS
    secondary: {
      light: '#FEFEFE',
      main: '#BDBFCF',
      dark: '#AAACBB',
      contrastText: '#26262E'
    },
    error: {
      light: '#FC624E',
      main: '#EE4C37',
      dark: '#C52713',
      contrastText: '#FFFFFF'
    },
    // BACKGROUND TEXT COLORS
    text: {
      primary: '#26262E',
      secondary: '#FFFFFF'
    }
  }
}

export const baseColorsDark: Required<Pick<ThemeOptions, 'palette'>> = {
  palette: {
    ...baseColorsLight.palette,
    mode: 'dark',
    background: { default: '#26262E' },
    primary: baseColorsLight.palette.secondary,
    secondary: baseColorsLight.palette.primary,
    text: {
      primary: baseColorsLight.palette.text?.secondary,
      secondary: baseColorsLight.palette.text?.primary
    }
  }
}
