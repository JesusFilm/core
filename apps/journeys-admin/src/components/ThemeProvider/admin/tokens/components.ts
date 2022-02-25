import { ThemeOptions } from '@mui/material/styles'
import { palette, adminColorsLight } from './colors'

export const adminComponents: Required<Pick<ThemeOptions, 'components'>> = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 800,
          borderRadius: '1000px',
          textTransform: 'none'
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
    MuiToggleButton: {
      styleOverrides: {
        root: {
          paddingLeft: 30,
          paddingRight: 30,
          paddingTop: 12,
          paddingBottom: 12,
          borderRadius: 8,
          backgroundColor: palette[0],
          '&.Mui-selected': {
            backgroundColor: palette[100],
            color: palette.error
          }
        }
      }
    }
  }
}
