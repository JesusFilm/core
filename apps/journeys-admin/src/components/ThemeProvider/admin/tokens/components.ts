import { ThemeOptions } from '@mui/material/styles' 
import { palette } from './colors'

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
        sizeSmall: {
          fontSize: '14px',
          fontWeight: 'normal'
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
