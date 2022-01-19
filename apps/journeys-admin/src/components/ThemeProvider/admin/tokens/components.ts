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
