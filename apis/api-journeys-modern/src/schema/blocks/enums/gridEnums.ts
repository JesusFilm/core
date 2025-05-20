import { builder } from '../../builder'

// Create enum type for GridDirection
export const GridDirection = builder.enumType('GridDirection', {
  values: ['columnReverse', 'column', 'row', 'rowReverse'] as const
})

// Create enum type for GridJustifyContent
export const GridJustifyContent = builder.enumType('GridJustifyContent', {
  values: ['flexStart', 'flexEnd', 'center'] as const
})

// Create enum type for GridAlignItems
export const GridAlignItems = builder.enumType('GridAlignItems', {
  values: ['baseline', 'flexStart', 'flexEnd', 'center'] as const
})
