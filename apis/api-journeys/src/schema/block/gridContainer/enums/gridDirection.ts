import { builder } from '../../../builder'

// Define the grid direction values as a const array for reuse
const GRID_DIRECTION_VALUES = [
  'columnReverse',
  'column',
  'row',
  'rowReverse'
] as const

// Export the type for reuse
export type GridDirectionType = (typeof GRID_DIRECTION_VALUES)[number] | null

// Create enum type for GridDirection
export const GridDirection = builder.enumType('GridDirection', {
  values: GRID_DIRECTION_VALUES
})
