import { builder } from '../../../builder'

// Define the theme name values as a const array for reuse
const THEME_NAME_VALUES = ['base'] as const

// Export the type for reuse
export type ThemeNameType = (typeof THEME_NAME_VALUES)[number] | null

// Create enum type for ThemeName
export const ThemeName = builder.enumType('ThemeName', {
  values: THEME_NAME_VALUES
})
