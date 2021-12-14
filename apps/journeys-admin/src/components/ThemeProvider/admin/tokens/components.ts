import { ThemeOptions } from '@mui/material'

export const adminComponents: Required<Pick<ThemeOptions, 'components'>> = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: 4
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
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #DCDDE5'
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
          paddingRight: 24
        }
      }
    }
  }
}
