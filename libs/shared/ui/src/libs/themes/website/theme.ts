import { Theme, ThemeOptions, createTheme } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'

import { baseBreakpoints } from '../base/tokens/breakpoints'
import { baseSpacing } from '../base/tokens/spacing'

import { websiteColorsDark, websiteColorsLight } from './tokens/colors'
import { websiteComponents } from './tokens/components'
import { websiteTypography } from './tokens/typography'

interface ThemeProps {
  ssrMatchMedia?: (query: string) => { matches: boolean }
}

const websiteTheme = ({
  ssrMatchMedia
}: ThemeProps): Pick<
  ThemeOptions,
  'spacing' | 'components' | 'breakpoints' | 'typography' | 'direction'
> => {
  const components =
    ssrMatchMedia != null
      ? {
          ...websiteComponents.components,
          MuiUseMediaQuery: {
            defaultProps: {
              ssrMatchMedia
            }
          }
        }
      : websiteComponents.components

  return {
    ...baseSpacing,
    ...baseBreakpoints,
    ...websiteTypography,
    components
  }
}

export const getWebsiteLight = ({ ssrMatchMedia }: ThemeProps): Theme =>
  createTheme(deepmerge(websiteColorsLight, websiteTheme({ ssrMatchMedia })))

export const getWebsiteDark = ({ ssrMatchMedia }: ThemeProps): Theme =>
  createTheme(deepmerge(websiteColorsDark, websiteTheme({ ssrMatchMedia })))
