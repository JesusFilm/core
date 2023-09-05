import { Theme } from '@mui/material/styles'

import { getBaseDark, getBaseLight } from './base/theme'
import { getWebsiteDark, getWebsiteLight } from './website/theme'

export enum ThemeMode {
  dark = 'dark',
  light = 'light'
}

export enum ThemeName {
  base = 'base',
  website = 'website'
}

interface ThemeProps {
  themeName: ThemeName
  themeMode: ThemeMode
  rtl?: boolean
  locale?: string
  ssrMatchMedia?: (query: string) => { matches: boolean }
}

export const getTheme = ({
  themeName,
  themeMode,
  rtl = false,
  locale = '',
  ssrMatchMedia
}: ThemeProps): Theme => {
  const themes = {
    base: {
      light: getBaseLight({ rtl, locale, ssrMatchMedia }),
      dark: getBaseDark({ rtl, locale, ssrMatchMedia })
    },
    website: {
      light: getWebsiteLight({ ssrMatchMedia }),
      dark: getWebsiteDark({ ssrMatchMedia })
    }
  }
  return {
    ...themes[themeName][themeMode]
  }
}
