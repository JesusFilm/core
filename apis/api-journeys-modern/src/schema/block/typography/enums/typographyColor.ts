import { builder } from '../../../builder'

// Define the color values as a const array for reuse
const TYPOGRAPHY_COLOR_VALUES = ['primary', 'secondary', 'error'] as const

// Export the type for reuse
export type TypographyColorType =
  | (typeof TYPOGRAPHY_COLOR_VALUES)[number]
  | null

// Create enum type for TypographyColor
export const TypographyColor = builder.enumType('TypographyColor', {
  values: TYPOGRAPHY_COLOR_VALUES
})
