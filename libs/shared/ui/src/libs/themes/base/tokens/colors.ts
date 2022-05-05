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

declare module '@mui/material/styles/createPalette' {
  interface CardPaletteColorOptions {
    one?: string
    two?: string
    three?: string
    four?: string
    five?: string
    six?: string
    seven?: string
    eight?: string
    nine?: string
    ten?: string
    eleven?: string
    twelve?: string
    thirteen?: string
    fourteen?: string
    fifteen?: string
  }
  interface CardPaletteColor {
    one: string
    red: string
    three: string
    four: string
    five: string
    six: string
    seven: string
    eight: string
    nine: string
    ten: string
    eleven: string
    twelve: string
    thirteen: string
    fourteen: string
    fifteen: string
  }

  interface PaletteOptions {
    card?: CardPaletteColorOptions
  }
  interface Palette {
    card: CardPaletteColor
  }
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
        primary: primary.main,
        secondary: primary.light
      },
      action: {
        disabled: palette[700],
        disabledBackground: primary.main
      },
      // this must only be used for background color for cards
      card: {
        one: '#FFCDD2',
        two: '#F48FB1',
        three: '#CE93D8',
        four: '#B39DDB',
        five: '#9FA8DA',
        six: '#90CAF9',
        seven: '#81D4FA',
        eight: '#80DEEA',
        nine: '#80CBC4',
        ten: '#C8E6C9',
        eleven: '#C5E1A5',
        twelve: '#D7CCC8',
        thirteen: '#E0E0E0',
        fourteen: '#B0BEC5',
        fifteen: '#FEFEFE'
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
        primary: primary.main,
        secondary: primary.dark
      },
      action: {
        disabled: palette[300],
        disabledBackground: primary.main
      },
      // this must only be used for background color for cards
      card: {
        one: '#C62828',
        two: '#AD1457',
        three: '#6A1B9A',
        four: '#4527A0',
        five: '#283593',
        six: '#1565C0',
        seven: '#0277BD',
        eight: '#006064',
        nine: '#00695C',
        ten: '#2E7D32',
        eleven: '#33691E',
        twelve: '#4E342E',
        thirteen: '#424242',
        fourteen: '#37474F',
        fifteen: '#30313D'
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
      }
    }
  }
}
