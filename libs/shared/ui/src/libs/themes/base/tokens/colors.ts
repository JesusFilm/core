import { ThemeOptions } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    surface: Palette['primary']
  }
  interface PaletteOptions {
    surface?: PaletteOptions['primary']
  }
  interface Palette {
    surfaceAlt: Palette['primary']
  }
  interface PaletteOptions {
    surfaceAlt?: PaletteOptions['primary']
  }
}

export const baseColorsLight: Required<Pick<ThemeOptions, 'palette'>> = {
  palette: {
    mode: 'light',
    // DEFAULT CONTAINER COLORS
    background: { default: '#FEFEFE' },
    surface: {
      light: '#6D6F81',
      main: '#30313D',
      dark: '#26262E',
      contrastText: '#FFFFFF'
    },
    // OVERRIDE COLORS
    surfaceAlt: {
      light: '#FEFEFE',
      main: '#BDBFCF',
      dark: '#AAACBB',
      contrastText: '#26262E'
    },
    primary: {
      light: '#249DFF',
      main: '#086AE6',
      dark: '#0041B2',
      contrastText: '#FFFFFF'
    },
    secondary: {
      light: '#03DAC5',
      main: '#07C0B1',
      dark: '#018786',
      contrastText: '#FFFFFF'
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
    surface: baseColorsLight.palette.surfaceAlt,
    surfaceAlt: baseColorsLight.palette.surface,
    text: {
      primary: baseColorsLight.palette.text?.secondary,
      secondary: baseColorsLight.palette.text?.primary
    }
  }
}
