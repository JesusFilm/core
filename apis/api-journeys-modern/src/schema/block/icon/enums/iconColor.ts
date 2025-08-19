import { builder } from '../../../builder'

// Define the icon color values as a const array for reuse
const ICON_COLOR_VALUES = [
  'primary',
  'secondary',
  'action',
  'error',
  'disabled',
  'inherit'
] as const

// Export the type for reuse
export type IconColorType = (typeof ICON_COLOR_VALUES)[number] | null

// Create enum type for IconColor
export const IconColor = builder.enumType('IconColor', {
  values: ICON_COLOR_VALUES
})
