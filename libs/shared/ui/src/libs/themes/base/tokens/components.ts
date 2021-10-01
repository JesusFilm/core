// import { lightThemeToken } from './colors'
import { ThemeOptions } from '@mui/material'
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
    }
  }
}
