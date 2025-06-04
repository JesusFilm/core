import { builder } from '../../../builder'

// Define the color values as a const array for reuse
const BUTTON_COLOR_VALUES = [
  'primary',
  'secondary',
  'error',
  'inherit'
] as const

// Export the type for reuse
export type ButtonColorType = (typeof BUTTON_COLOR_VALUES)[number] | null

// Create enum type for ButtonColor
export const ButtonColor = builder.enumType('ButtonColor', {
  values: BUTTON_COLOR_VALUES
})
