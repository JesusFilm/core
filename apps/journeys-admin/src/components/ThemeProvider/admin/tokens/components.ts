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
    }
  }
}
