import { Theme } from '@mui/material/styles'
import { baseDark, baseLight } from './base/theme'

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
}

export const getTheme = ({ themeName, themeMode }: ThemeProps): Theme => {
  const themes = {
    base: { light: baseLight, dark: baseDark }
  }
  return {
    ...themes[themeName][themeMode]
  }
}
