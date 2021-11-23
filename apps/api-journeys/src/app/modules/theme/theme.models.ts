import { registerEnumType } from '@nestjs/graphql'

export enum ThemeMode {
  dark = 'dark',
  light = 'light'
}
registerEnumType(ThemeMode, { name: 'ThemeMode' })

export enum ThemeName {
  base = 'base'
}
registerEnumType(ThemeName, { name: 'ThemeName' })
