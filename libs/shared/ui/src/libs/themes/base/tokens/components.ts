import { ThemeOptions } from '@mui/material'
import { spacingTheme } from '../tokens/spacing'

export const baseComponents: Pick<ThemeOptions, 'components'> = {
  components: {
    MuiTypography: {
      styleOverrides: {
        gutterBottom: {
          marginBottom: spacingTheme.spacing(4),
          '&:last-child': {
            marginBottom: 0
          }
        }
      },
      variants: [
        {
          props: { variant: 'overline', gutterBottom: true },
          style: {
            marginBottom: spacingTheme.spacing(1),
            '&:last-child': {
              marginBottom: 0
            }
          }
        }
      ]
    }
    // TODO: Add Button component override
  }
}
