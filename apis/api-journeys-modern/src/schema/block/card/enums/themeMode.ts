import { builder } from '../../../builder'

// Define the theme mode values as a const array for reuse
const THEME_MODE_VALUES = ['dark', 'light'] as const

// Export the type for reuse
export type ThemeModeType = (typeof THEME_MODE_VALUES)[number] | null

// Create enum type for ThemeMode
export const ThemeMode = builder.enumType('ThemeMode', {
  values: THEME_MODE_VALUES
})
