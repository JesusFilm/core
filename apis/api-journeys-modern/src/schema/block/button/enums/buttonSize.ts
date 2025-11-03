import { builder } from '../../../builder'

// Define the size values as a const array for reuse
const BUTTON_SIZE_VALUES = ['small', 'medium', 'large'] as const

// Export the type for reuse
export type ButtonSizeType = (typeof BUTTON_SIZE_VALUES)[number] | null

// Create enum type for ButtonSize
export const ButtonSize = builder.enumType('ButtonSize', {
  values: BUTTON_SIZE_VALUES
})
