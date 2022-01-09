import { ThemeOptions } from '@mui/material'

export const adminComponents: Required<Pick<ThemeOptions, 'components'>> = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 'bold',
          borderRadius: '1000px',
          textTransform: 'none'
        },
        sizeMedium: {
          fontWeight: 700,
          fontSize: '15px',
          lineHeight: '18px',
          padding: '6px 12px',
          borderRadius: '12px',
          margin: '26px 0px'
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
