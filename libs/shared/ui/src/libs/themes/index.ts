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
  themeMode: ThemeMode
  themeName: ThemeName
  rtl?: boolean
}

export const getTheme = ({
  themeName,
  themeMode,
  rtl = false
}: ThemeProps): Theme => {
  const themes = {
    base: { light: getBaseLight(rtl), dark: getBaseDark(rtl) }
  }
  return {
    ...themes[themeName][themeMode]
  }
}
