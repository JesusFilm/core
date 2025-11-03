import { builder } from '../../../builder'

// Define the icon size values as a const array for reuse
const ICON_SIZE_VALUES = ['sm', 'md', 'lg', 'xl', 'inherit'] as const

// Export the type for reuse
export type IconSizeType = (typeof ICON_SIZE_VALUES)[number] | null

// Create enum type for IconSize
export const IconSize = builder.enumType('IconSize', {
  values: ICON_SIZE_VALUES
})
