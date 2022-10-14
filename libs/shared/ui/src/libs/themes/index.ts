import { Theme } from '@mui/material/styles'
import { getBaseLight, getBaseDark } from './base/theme'

export enum ThemeMode {
  dark = 'dark',
  light = 'light'
}

export enum ThemeName {
  base = 'base'
}

export const getTheme = (
  themeName: ThemeName,
  themeMode: ThemeMode,
  rtl: boolean
): Theme => {
  const themes = {
    base: { light: getBaseLight(rtl), dark: getBaseDark(rtl) }
  }
  return {
    ...themes[themeName][themeMode]
  }
}
