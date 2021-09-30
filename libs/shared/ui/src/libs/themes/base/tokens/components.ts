// import { lightThemeToken } from './colors'
import { ThemeOptions } from '@mui/material'
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
        }
      }
    },
    MuiButton: {
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
