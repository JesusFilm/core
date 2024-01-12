import { ThemeOptions } from '@mui/material/styles'

import { palette } from './colors'

export const adminComponents: Required<Pick<ThemeOptions, 'components'>> = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 800,
          borderRadius: '12px',
          textTransform: 'none'
        },
        contained: {
          boxShadow: 'none'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none'
        }
      }
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        colorDefault: {
          backgroundColor: palette[0]
        }
      }
    },
    MuiToolbar: {
      defaultProps: {
        variant: 'dense'
      },
      styleOverrides: {
        dense: {
          maxHeight: 48,
          paddingLeft: 24,
          paddingRight: 24,
          borderBottom: '1px solid',
          borderColor: palette[200]
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontWeight: 600,
          fontFamily: "'Montserrat', sans-serif"
        },
        secondary: {
          color: palette[800]
        }
      }
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: 'h1',
          h2: 'h2',
          h3: 'h3',
          h4: 'h4',
          h5: 'h5',
          h6: 'h6',
          subtitle1: 'h6',
          subtitle2: 'h6',
          subtitle3: 'h6',
          body1: 'p',
          body2: 'p',
          overline: 'span',
          overline2: 'span',
          caption: 'span'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          // this is equal to 100vh - the maxHeight prop of MuiToolbar also defined in this file so that drawers don't cover the appbar
          maxHeight: `calc(100vh - 48px)`
        }
      }
    }
  }
}
