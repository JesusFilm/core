import { builder } from '../../../builder'

// Define the variant values as a const array for reuse
const TYPOGRAPHY_VARIANT_VALUES = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'caption',
  'overline'
] as const

// Export the type for reuse
export type TypographyVariantType =
  | (typeof TYPOGRAPHY_VARIANT_VALUES)[number]
  | null

// Create enum type for TypographyVariant
export const TypographyVariant = builder.enumType('TypographyVariant', {
  values: TYPOGRAPHY_VARIANT_VALUES
})
