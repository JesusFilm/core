import { ThemeOptions } from '@mui/material'
import { palette } from './colors'

export const adminComponents: Required<Pick<ThemeOptions, 'components'>> = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 'bold',
          borderRadius: '1000px'
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
          paddingLeft: 24,
          paddingRight: 24,
          borderBottom: '1px solid',
          borderColor: palette[200]
        }
      }
    }
  }
}
