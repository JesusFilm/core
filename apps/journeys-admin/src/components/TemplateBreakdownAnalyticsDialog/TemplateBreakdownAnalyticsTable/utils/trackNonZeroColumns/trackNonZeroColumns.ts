import { NUMERIC_COLUMNS } from '../constants'
import { ProcessedRow, SortableColumn } from '../types'

export interface TrackNonZeroColumnsParams {
  row: ProcessedRow
  columnsWithNonZero: Set<SortableColumn>
}

export type TrackNonZeroColumnsReturn = void

/**
 * Tracks which columns have non-zero values, only checking columns that haven't been found yet
 */
export function trackNonZeroColumns(
  row: ProcessedRow,
  columnsWithNonZero: Set<SortableColumn>
): void {
  // Early exit if all columns are already marked as non-zero
  if (columnsWithNonZero.size >= NUMERIC_COLUMNS.length) {
    return
  }

  for (const column of NUMERIC_COLUMNS) {
    // Skip if this column is already known to have non-zero values
    if (!columnsWithNonZero.has(column) && row[column] !== 0) {
      columnsWithNonZero.add(column)
      // Early exit if all columns are now marked as non-zero
      if (columnsWithNonZero.size === NUMERIC_COLUMNS.length) {
        break
      }
    }
  }
}
