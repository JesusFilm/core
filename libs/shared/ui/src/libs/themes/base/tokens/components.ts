import { ThemeOptions } from '@mui/material'
import { spacingTheme } from '../tokens/spacing'

export const baseComponents: Pick<ThemeOptions, 'components'> = {
  components: {
    MuiTypography: {
      styleOverrides: {
        gutterBottom: {
          marginBottom: spacingTheme.spacing(3)
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
    }
  }
}
