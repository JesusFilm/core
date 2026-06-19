import { builder } from '../../../builder'

// Define the grid align items values as a const array for reuse
const GRID_ALIGN_ITEMS_VALUES = [
  'baseline',
  'flexStart',
  'flexEnd',
  'center'
] as const

// Export the type for reuse
export type GridAlignItemsType = (typeof GRID_ALIGN_ITEMS_VALUES)[number] | null

// Create enum type for GridAlignItems
export const GridAlignItems = builder.enumType('GridAlignItems', {
  values: GRID_ALIGN_ITEMS_VALUES
})
