import { builder } from '../../builder'

// Create enum type for IconColor
export const IconColor = builder.enumType('IconColor', {
  values: [
    'primary',
    'secondary',
    'action',
    'error',
    'disabled',
    'inherit'
  ] as const
})

// Create enum type for IconSize
export const IconSize = builder.enumType('IconSize', {
  values: ['sm', 'md', 'lg', 'xl', 'inherit'] as const
})
