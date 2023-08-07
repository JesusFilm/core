import { Theme } from '@mui/material/styles'

import { getBaseDark, getBaseLight } from './base/theme'
import { websiteDark, websiteLight } from './website/theme'

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
}

export const getTheme = ({
  themeName,
  themeMode,
  rtl = false,
  locale = ''
}: ThemeProps): Theme => {
  const themes = {
    base: { light: getBaseLight(rtl, locale), dark: getBaseDark(rtl, locale) },
    website: { light: websiteLight, dark: websiteDark }
  }
  return {
    ...themes[themeName][themeMode]
  }
}
