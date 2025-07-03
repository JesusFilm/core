import { builder } from '../../../builder'

// Define the text response type values as a const array for reuse
const TEXT_RESPONSE_TYPE_VALUES = [
  'freeForm',
  'name',
  'email',
  'phone'
] as const

// Export the type for reuse
export type TextResponseTypeType =
  | (typeof TEXT_RESPONSE_TYPE_VALUES)[number]
  | null

// Create enum type for TextResponseType
export const TextResponseType = builder.enumType('TextResponseType', {
  values: TEXT_RESPONSE_TYPE_VALUES
})
