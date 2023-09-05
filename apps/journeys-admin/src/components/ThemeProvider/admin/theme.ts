import { Theme, ThemeOptions, createTheme } from '@mui/material/styles'

import { adminColorsLight } from './tokens/colors'
import { adminComponents } from './tokens/components'
import { adminSpacing } from './tokens/spacing'
import { adminTypography } from './tokens/typography'

export const adminTheme = (
  ssrMatchMedia?: (query: string) => {
    matches: boolean
  }
): Pick<ThemeOptions, 'spacing' | 'components' | 'typography' | 'palette'> => {
  const components =
    ssrMatchMedia != null
      ? {
          ...adminComponents.components,
          MuiUseMediaQuery: {
            defaultProps: {
              ssrMatchMedia
            }
          }
        }
      : adminComponents.components

  return {
    ...adminColorsLight,
    ...adminTypography,
    ...adminSpacing,
    components
  }
}

// admin only available in light mode
export const getAdminLight = (
  ssrMatchMedia: (query: string) => { matches: boolean }
): Theme => createTheme(adminTheme(ssrMatchMedia))
