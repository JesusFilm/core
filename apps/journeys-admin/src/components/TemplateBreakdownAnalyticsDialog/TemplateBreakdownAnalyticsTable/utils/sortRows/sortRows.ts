import { Order, ProcessedRow, SortableColumn } from '../types'

export interface SortRowsParams {
  rows: ProcessedRow[]
  orderBy: SortableColumn
  order: Order
}

export type SortRowsReturn = ProcessedRow[]

/**
 * Sorts rows based on the current sort order and column
 */
export function sortRows(
  rows: ProcessedRow[],
  orderBy: SortableColumn,
  order: Order
): ProcessedRow[] {
  return [...rows].sort((a, b) => {
    const sortKey = orderBy === 'journeyName' ? 'teamName' : orderBy
    const aValue = a[sortKey]
    const bValue = b[sortKey]
    const comparison =
      typeof aValue === 'number' && typeof bValue === 'number'
        ? aValue - bValue
        : String(aValue).localeCompare(String(bValue))
    return order === 'asc' ? comparison : -comparison
  })
}
