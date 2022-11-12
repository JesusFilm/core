import { ThemeOptions } from '@mui/material/styles'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { baseBreakpoints } from '../../base/tokens/breakpoints'
import { typography } from './typography'

export const websiteComponents: Required<Pick<ThemeOptions, 'components'>> = {
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          '&:not(.MuiContainer-disableGutters)': {
            paddingLeft: 24,
            paddingRight: 24,
            [baseBreakpoints.breakpoints.up('sm') ?? '']: {
              paddingLeft: 24,
              paddingRight: 24
            }
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          gap: '8px',
          borderRadius: '8px'
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
            fontSize: '24px',
            lineHeight: '32px',
            fontWeight: 400,
            padding: '20px 28px'
          }
        },
        {
          props: { size: 'medium' },
          style: {
            fontSize: '20px',
            lineHeight: '28px',
            fontWeight: 500,
            padding: '16px 24px'
          }
        },
        {
          props: { size: 'small' },
          style: {
            fontSize: '16px',
            lineHeight: '24px',
            fontWeight: 700,
            padding: '12px 20px'
          }
        }
      ]
    },
    MuiSelect: {
      defaultProps: {
        IconComponent: KeyboardArrowDownIcon
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiButtonBase-root.MuiTab-root': {
            ...typography.overline1
          }
        }
      }
    }
  }
}
