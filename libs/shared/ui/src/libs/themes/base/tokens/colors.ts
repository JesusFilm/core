import { SimplePaletteColorOptions, ThemeOptions } from '@mui/material/styles'

const errorLight = '#FF6B58'
const errorDark = '#B62D1C'

const palette = {
  900: '#26262E',
  800: '#30313D',
  700: '#6D6F81',
  300: '#AAACBB',
  200: '#DCDDE5',
  100: '#FEFEFE',
  0: '#FFFFFF'
}

export const baseColorsLight = (): Required<
  Pick<ThemeOptions, 'palette' | 'components'>
> => {
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
    main: errorDark,
    contrastText: palette[0]
  }

  return {
    palette: {
      grey: palette,
      mode: 'light',
      background: { default: palette[0], paper: palette[100] },
      primary,
      secondary,
      error,
      text: {
        primary: primary.main,
        secondary: primary.light
      },
      action: {
        disabled: palette[700],
        disabledBackground: primary.main
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            '&:hover': {
              backgroundColor: palette[700]
            }
          }
        }
      },
      MuiButtonGroup: {
        styleOverrides: {
          groupedContainedVertical: {
            '&:not(:last-of-type)': {
              borderBottom: `1px solid ${palette[700]}`
            }
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            ':hover': {
              color: primary.main,
              backgroundColor: `rgba(0, 0, 0 ,0)`
            },
            ':disabled': {
              color: palette[300]
            }
          }
        }
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: primary.main
          }
        }
      }
    }
  }
}

export const baseColorsDark = (): Required<
  Pick<ThemeOptions, 'palette' | 'components'>
> => {
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
    main: errorLight,
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
        primary: primary.main,
        secondary: primary.dark
      },
      action: {
        disabled: palette[300],
        disabledBackground: primary.main
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            '&:hover': {
              backgroundColor: palette[300]
            }
          }
        }
      },
      MuiButtonGroup: {
        styleOverrides: {
          groupedContainedVertical: {
            '&:not(:last-of-type)': {
              borderBottom: `1px solid ${palette[300]}`
            }
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            ':hover': {
              color: primary.main,
              backgroundColor: `rgba(0, 0, 0 ,0)`
            },
            ':disabled': {
              color: palette[700]
            }
          }
        }
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: primary.main
          }
        }
      }
    }
  }
}
