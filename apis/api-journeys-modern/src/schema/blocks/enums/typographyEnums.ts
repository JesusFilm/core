import { builder } from '../../builder'

// Create enum type for TypographyVariant
export const TypographyVariant = builder.enumType('TypographyVariant', {
  values: [
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
})

// Create enum type for TypographyColor
export const TypographyColor = builder.enumType('TypographyColor', {
  values: ['primary', 'secondary', 'error'] as const
})

// Create enum type for TypographyAlign
export const TypographyAlign = builder.enumType('TypographyAlign', {
  values: ['left', 'center', 'right'] as const
})
