'use client'

import { ThemeOptions } from '@mui/material/styles'

import { FontFamilies } from '../..'

import { spacingThemeToken } from './spacing'
import { createFontFamilyString } from './typography'

export const createBaseComponents = (
  fontFamilies?: FontFamilies
): Required<Pick<ThemeOptions, 'components'>> => {
  const bodyFontFamily = createFontFamilyString(fontFamilies?.bodyFont ?? '')

  return {
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
              minHeight: '42px',
              borderRadius: '16px',
              fontWeight: 700
            }
          },
          {
            props: { size: 'medium' },
            style: {
              minHeight: '36.5px',
              borderRadius: '12px',
              fontWeight: 700
            }
          },
          {
            props: { size: 'small' },
            style: {
              minHeight: '30.75px',
              borderRadius: '8px'
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
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontFamily: bodyFontFamily
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
}
