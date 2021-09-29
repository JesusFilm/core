import { lightThemeToken } from './colors'
import { ThemeOptions } from '@mui/material'
import { spacingThemeToken } from './spacing'

export const baseComponents: Required<Pick<ThemeOptions, 'components'>> = {
  components: {
    MuiButtonGroup: {
      styleOverrides: {
        groupedContainedVertical: {
          margin: 0
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          marginBottom: spacingThemeToken.spacing(3),
          backgroundColor: lightThemeToken.palette.primary.main,
          color: lightThemeToken.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: lightThemeToken.palette.primary.light
          },
          '&:focus': {
            backgroundColor: lightThemeToken.palette.primary.light
          },
          '&:disabled': {
            backgroundColor: lightThemeToken.palette.primary.light,
            color: lightThemeToken.palette.primary.contrastText
          }
        },
        containedSecondary: {
          marginBottom: spacingThemeToken.spacing(3),
          backgroundColor: lightThemeToken.palette.secondary.main,
          color: lightThemeToken.palette.secondary.contrastText,
          '&:hover': {
            backgroundColor: lightThemeToken.palette.secondary.light
          },
          '&:focus': {
            backgroundColor: lightThemeToken.palette.secondary.light
          },
          '&:disabled': {
            backgroundColor: lightThemeToken.palette.secondary.light,
            color: lightThemeToken.palette.secondary.contrastText
          }
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
            borderRadius: '16px'
          }
        },
        {
          props: { variant: 'contained', size: 'medium' },
          style: {
            marginBottom: spacingThemeToken.spacing(2),
            borderRadius: '12px'
          }
        },
        {
          props: { variant: 'contained', size: 'small' },
          style: {
            marginBottom: spacingThemeToken.spacing(1),
            borderRadius: '8px'
          }
        }
      ]
    }
  }
}

// Add other component override tokens here
