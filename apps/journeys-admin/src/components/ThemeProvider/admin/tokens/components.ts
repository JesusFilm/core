import { ThemeOptions } from '@mui/material'
import { palette } from './colors'

export const adminComponents: Required<Pick<ThemeOptions, 'components'>> = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 'bold',
          borderRadius: 40
        },
        sizeSmall: {
          fontSize: '14px',
          fontWeight: 'normal'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 'bold',
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
    }
  }
}
