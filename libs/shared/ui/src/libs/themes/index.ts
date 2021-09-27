import { Theme } from '@mui/material'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { baseDark, baseLight } from './base/theme'

type ThemeMap = Record<ThemeName, Record<ThemeMode, Theme>>

export const themes: ThemeMap = {
  base: { light: baseLight, dark: baseDark }
}
