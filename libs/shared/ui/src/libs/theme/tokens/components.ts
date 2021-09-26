import { baseColorsLight } from './colors'
import { baseSpacing } from './spacing'

export const baseComponents = {
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          marginBottom: baseSpacing.space.lg * baseSpacing.spacing
        }
      },
      variants: [
        {
          props: { variant: 'overline' as const },
          style: {
            marginBottom: baseSpacing.space.sm * baseSpacing.spacing
          }
        }
      ]
    },
    MuiButton: {
      styleOverrides: {
        root: {
          marginBottom: baseSpacing.space.lg * baseSpacing.spacing,
          backgroundColor: baseColorsLight.palette.surface.main,
          color: baseColorsLight.palette.surface.contrastText,
          '&:hover': {
            backgroundColor: baseColorsLight.palette.surface.light
          },
          '&:focus': {
            backgroundColor: baseColorsLight.palette.surface.light
          }
        }
      },
      defaultProps: {
        disableRipple: true
      },
      variants: [
        {
          props: { variant: 'contained' as const, size: 'large' as const },
          style: {
            marginBottom: baseSpacing.space.lg * baseSpacing.spacing,
            borderRadius: '16px'
          }
        },
        {
          props: { variant: 'contained' as const, size: 'medium' as const },
          style: {
            marginBottom: baseSpacing.space.md * baseSpacing.spacing,
            borderRadius: '12px'
          }
        },
        {
          props: { variant: 'contained' as const, size: 'small' as const },
          style: {
            marginBottom: baseSpacing.space.sm * baseSpacing.spacing,
            borderRadius: '8px'
          }
        },
        {
          props: { variant: 'text' as const },
          style: {
            color: baseColorsLight.palette.surfaceAlt.contrastText,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'transparent'
            },
            '&:focus': {
              backgroundColor: 'transparent'
            }
          }
        }
      ]
    }
  }
}

// Add other component override tokens here
