import { ThemeOptions, SimplePaletteColorOptions } from '@mui/material/styles'

const palette = {
  errorLight: '#FF6B58',
  errorDark: '#B62D1C',
  900: '#26262E',
  800: '#30313D',
  700: '#6D6F81',
  300: '#AAACBB',
  200: '#DCDDE5',
  100: '#FEFEFE',
  0: '#FFFFFF'
}

export const baseColorsLight = (): Required<Pick<ThemeOptions, 'palette'>> => {
  const primary: Required<SimplePaletteColorOptions> = {
    light: palette[800],
    main: palette[900],
    dark: palette[900],
    contrastText: palette[0]
  }

  const secondary: SimplePaletteColorOptions = {
    main: palette[800],
    contrastText: palette[0]
  }

  const error: SimplePaletteColorOptions = {
    main: palette.errorDark,
    contrastText: palette[0]
  }

  return {
    palette: {
      mode: 'light',
      background: { default: palette[0], paper: palette[100] },
      primary,
      secondary,
      error,
      text: {
        primary: primary.dark,
        secondary: primary.main
      },
      action: {
        // DISABLED BUTTON COLORS
        disabled: palette[700],
        disabledBackground: primary.dark
      }
    }
  }
}

export const baseColorsDark = (): Required<Pick<ThemeOptions, 'palette'>> => {
  const primary: Required<SimplePaletteColorOptions> = {
    light: palette[100],
    main: palette[100],
    dark: palette[200],
    contrastText: palette[900]
  }

  const secondary: SimplePaletteColorOptions = {
    main: palette[200],
    contrastText: palette[900]
  }

  const error: SimplePaletteColorOptions = {
    main: palette.errorLight,
    contrastText: palette[900]
  }

  return {
    palette: {
      ...baseColorsLight().palette,
      mode: 'dark',
      background: { default: palette[900], paper: palette[800] },
      primary,
      secondary,
      error,
      text: {
        primary: palette[100],
        secondary: palette[200]
      },
      action: {
        disabled: primary.light,
        disabledBackground: primary.dark
      }
    }
  }
}
