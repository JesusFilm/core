import { ThemeOptions } from '@mui/material/styles'
import { spacingThemeToken } from './spacing'

export const baseComponents: Required<Pick<ThemeOptions, 'components'>> = {
  components: {
    MuiTypography: {
      styleOverrides: {
        gutterBottom: {
          marginBottom: spacingThemeToken.spacing(4),
          '&:last-child': {
            marginBottom: 0
          }
        }
      },
      variants: [
        {
          props: { variant: 'overline', gutterBottom: true },
          style: {
            marginBottom: spacingThemeToken.spacing(1),
            '&:last-child': {
              marginBottom: 0
            }
          }
        }
      ]
    },
    MuiButtonGroup: {
      styleOverrides: {
        groupedContainedVertical: {
          margin: 0
        },
        root: {
          borderRadius: 8
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none'
        }
      },
      defaultProps: {
        disableRipple: true
      },
      variants: [
        {
          props: {
            variant: 'contained',
            size: 'large'
          },
          style: {
            marginBottom: spacingThemeToken.spacing(3),
            borderRadius: '16px',
            fontWeight: 700,
            '&:last-child': { marginBottom: 0 }
          }
        },
        {
          props: { variant: 'contained', size: 'medium' },
          style: {
            marginBottom: spacingThemeToken.spacing(2),
            borderRadius: '12px',
            fontWeight: 700,
            '&:last-child': { marginBottom: 0 }
          }
        },
        {
          props: { variant: 'contained', size: 'small' },
          style: {
            marginBottom: spacingThemeToken.spacing(1),
            borderRadius: '8px',
            '&:last-child': { marginBottom: 0 }
          }
        }
      ]
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '&.MuiTextField-root': {
            marginBottom: spacingThemeToken.spacing(2)
          }
        }
      }
    },
    // TODO: Use Mui-filled
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(173, 173, 173, 0.3)',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0
        },
        notchedOutline: {
          borderLeft: 'none',
          borderTop: 'none',
          borderRight: 'none',
          borderWidth: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0
        },
        input: {
          transform: `translate(0px, 6px) scale(1)`,
          transition: `color 200ms cubic-bezier(0.0,0,0.2,1) 0ms,transform 200ms cubic-bezier(0.0,0,0.2,1) 0ms,max-width 200ms cubic-bezier(0.0,0,0.2,1) 0ms`,
          // https://github.com/mui-org/material-ui/issues/14427
          '&:-webkit-autofill': {
            transitionDelay: '9999s',
            transitionProperty: 'background-color, color',
            '-webkit-box-shadow': 'none'
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        outlined: {
          '&.MuiInputLabel-shrink': {
            transform: `translate(14px, 5px) scale(0.75)`
          }
        }
      }
    }
  }
}
