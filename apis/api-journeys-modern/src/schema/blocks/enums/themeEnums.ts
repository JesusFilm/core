import { builder } from '../../builder'

// Create enum type for ThemeMode
export const ThemeMode = builder.enumType('ThemeMode', {
  values: ['dark', 'light'] as const
})

// Create enum type for ThemeName
export const ThemeName = builder.enumType('ThemeName', {
  values: ['base'] as const
})
