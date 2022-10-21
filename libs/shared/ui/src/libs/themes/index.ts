import { Theme } from '@mui/material/styles'
import { getBaseLight, getBaseDark } from './base/theme'

export enum ThemeMode {
  dark = 'dark',
  light = 'light'
}

export enum ThemeName {
  base = 'base'
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
    base: { light: getBaseLight(rtl, locale), dark: getBaseDark(rtl, locale) }
  }
  return {
    ...themes[themeName][themeMode]
  }
}
