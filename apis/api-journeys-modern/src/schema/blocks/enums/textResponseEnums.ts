import { builder } from '../../builder'

// Create enum type for TextResponseType
export const TextResponseType = builder.enumType('TextResponseType', {
  values: ['freeForm', 'name', 'email', 'phone'] as const
})
