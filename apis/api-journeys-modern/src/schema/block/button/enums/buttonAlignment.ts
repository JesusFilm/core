import { builder } from '../../../builder'

// Define the size values as a const array for reuse
const BUTTON_ALIGNMENT_VALUES = ['left', 'center', 'right', 'justify'] as const

// Export the type for reuse
export type ButtonAlignmentType =
  | (typeof BUTTON_ALIGNMENT_VALUES)[number]
  | null

// Create enum type for ButtonSize
export const ButtonAlignment = builder.enumType('ButtonAlignment', {
  values: BUTTON_ALIGNMENT_VALUES
})
