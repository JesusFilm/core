import { builder } from '../../../builder'

// Define the variant values as a const array for reuse
const BUTTON_VARIANT_VALUES = ['text', 'contained', 'outlined'] as const

// Export the type for reuse
export type ButtonVariantType = (typeof BUTTON_VARIANT_VALUES)[number] | null

// Create enum type for ButtonVariant
export const ButtonVariant = builder.enumType('ButtonVariant', {
  values: BUTTON_VARIANT_VALUES
})
