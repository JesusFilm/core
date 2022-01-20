import { ThemeOptions } from '@mui/material/styles'
import { palette } from './colors'

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
    MuiToggleButtonGroup: {
      defaultProps: {
        color: 'primary'
      },
      styleOverrides: {
        grouped: {
          textTransform: 'none',
          backgroundColor: palette[0],
          '&:not(.Mui-selected)': { color: 'black' },
          '&:not(.first-of-type)': {
            borderTop: '1px solid',
            borderColor: palette[200]
          },
          '&.Mui-selected': {
            backgroundColor: palette[100],
            color: 'primary'
          },
          '&:hover': {
            backgroundColor: palette[100]
          }
        },
        groupedVertical: {
          '&:first-of-type': {
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
          },
          '&:last-of-type': {
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12
          }
        }
      }
    }
  }
}
