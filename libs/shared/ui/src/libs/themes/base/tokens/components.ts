import { ThemeOptions } from '@mui/material'
import { spacingTheme } from '../tokens/spacing'

export const baseComponents: Pick<ThemeOptions, 'components'> = {
  components: {
    MuiTypography: {
      styleOverrides: {
        gutterBottom: {
          marginBottom: spacingTheme.spacing(4)
        }
      },
      variants: [
        {
          props: { variant: 'overline', gutterBottom: true },
          style: {
            marginBottom: spacingTheme.spacing(1)
          }
        }
      ]
    },
    // TODO: Add Button component override
    MuiOutlinedInput: {
      styleOverrides: {
        // Name of the slot
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
          // color: ,
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
