import { builder } from '../../../builder'

// Define the grid justify content values as a const array for reuse
const GRID_JUSTIFY_CONTENT_VALUES = ['flexStart', 'flexEnd', 'center'] as const

// Export the type for reuse
export type GridJustifyContentType =
  | (typeof GRID_JUSTIFY_CONTENT_VALUES)[number]
  | null

// Create enum type for GridJustifyContent
export const GridJustifyContent = builder.enumType('GridJustifyContent', {
  values: GRID_JUSTIFY_CONTENT_VALUES
})
