'use client'

import { ThemeOptions } from '@mui/material/styles'

import { spacingThemeToken } from './spacing'

export const baseComponents: Required<Pick<ThemeOptions, 'components'>> = {
  components: {
    MuiTypography: {
      styleOverrides: {
        gutterBottom: {
          marginBottom: spacingThemeToken.spacing(4)
        }
      },
      variants: [
        {
          props: { variant: 'overline', gutterBottom: true },
          style: {
            marginBottom: spacingThemeToken.spacing(1)
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
            size: 'large'
          },
          style: {
            fontSize: '18px',
            lineHeight: '24px',
            fontWeight: 700,
            minHeight: '56px',
            padding: '14.5px 24px',
            borderRadius: '32px'
          }
        },
        {
          props: { size: 'medium' },
          style: {
            fontSize: '16px',
            lineHeight: '20px',
            fontWeight: 700,
            minHeight: '48px',
            padding: '12px 24px',
            borderRadius: '24px'
          }
        },
        {
          props: { size: 'small' },
          style: {
            fontSize: '14px',
            lineHeight: '18px',
            fontWeight: 700,
            minHeight: '40px',
            padding: '11px 16px',
            borderRadius: '24px'
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
            WebkitBoxShadow: 'none'
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
    },
    MuiLink: {
      styleOverrides: {
        root: {
          paddingLeft: 10,
          opacity: 0.7,
          '@media (hover: hover)': {
            '&:hover': {
              opacity: 1
            }
          }
        }
      }
    }
  }
}
