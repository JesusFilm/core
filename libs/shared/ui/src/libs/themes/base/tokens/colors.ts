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
    background: { default: '#FEFEFE', paper: '#FEFEFE' },
    primary,
    secondary,
    error: {
      light: '#FC624E',
      main: '#EE4C37',
      dark: '#C52713',
      contrastText: '#FFFFFF'
    },
    text: {
      primary: primary.dark,
      secondary: primary.main
    },
    action: {
      // DISABLED BUTTON COLORS
      disabled: primary.light,
      disabledBackground: primary.dark
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
    },
    MuiButtonGroup: {
      styleOverrides: {
        groupedContainedVertical: {
          '&:not(:last-of-type), &:disabled': {
            borderBottom: `1px solid ${secondary.main}`
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
    primary: secondary,
    secondary: primary,
    text: {
      primary: secondary.light,
      secondary: secondary.main
    },
    action: {
      // DISABLED BUTTON COLORS
      disabled: secondary.light,
      disabledBackground: secondary.dark
    }
  },
  components: {
    ...baseColorsLight.components,
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
