import { builder } from '../../builder'

// Create enum type for ButtonVariant
export const ButtonVariant = builder.enumType('ButtonVariant', {
  values: ['text', 'contained'] as const
})

// Create enum type for ButtonColor
export const ButtonColor = builder.enumType('ButtonColor', {
  values: ['primary', 'secondary', 'error', 'inherit'] as const
})

// Create enum type for ButtonSize
export const ButtonSize = builder.enumType('ButtonSize', {
  values: ['small', 'medium', 'large'] as const
})
