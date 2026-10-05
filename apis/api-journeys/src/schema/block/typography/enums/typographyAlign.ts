import { builder } from '../../../builder'

// Define the align values as a const array for reuse
const TYPOGRAPHY_ALIGN_VALUES = ['left', 'center', 'right'] as const

// Export the type for reuse
export type TypographyAlignType =
  | (typeof TYPOGRAPHY_ALIGN_VALUES)[number]
  | null

// Create enum type for TypographyAlign
export const TypographyAlign = builder.enumType('TypographyAlign', {
  values: TYPOGRAPHY_ALIGN_VALUES
})
