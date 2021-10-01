import { ThemeOptions, PaletteColorOptions } from '@mui/material/styles'

const primary: PaletteColorOptions = {
  light: '#6D6F81',
  main: '#30313D',
  dark: '#26262E',
  contrastText: '#FFFFFF'
}

const secondary: PaletteColorOptions = {
  light: '#FEFEFE',
  main: '#BDBFCF',
  dark: '#AAACBB',
  contrastText: '#26262E'
}

export const baseColorsLight: Required<
  Pick<ThemeOptions, 'palette' | 'components'>
> = {
  palette: {
    mode: 'light',
    // DEFAULT CONTAINER COLORS
    background: { default: '#FEFEFE', paper: '#FEFEFE' },
    primary,
    secondary,
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
    },
    action: {
      // DISABLED BUTTON COLORS
      disabled: '#FFFFFF',
      disabledBackground: '#30313D'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: primary.dark,
          '&:hover': {
            backgroundColor: primary.main
          }
        }
      }
    }
  }
}

export const baseColorsDark: Required<
  Pick<ThemeOptions, 'palette' | 'components'>
> = {
  palette: {
    ...baseColorsLight.palette,
    mode: 'dark',
    background: { default: '#26262E', paper: '#26262E' },
    primary: baseColorsLight.palette.secondary,
    secondary: baseColorsLight.palette.primary,
    text: {
      primary: baseColorsLight.palette.text?.secondary,
      secondary: baseColorsLight.palette.text?.primary
    },
    action: {
      // DISABLED BUTTON COLORS
      disabled: '#26262E',
      disabledBackground: '#BDBFCF'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: secondary.light,
          '&:hover': {
            backgroundColor: secondary.main
          }
        }
      }
    }
  }
}
