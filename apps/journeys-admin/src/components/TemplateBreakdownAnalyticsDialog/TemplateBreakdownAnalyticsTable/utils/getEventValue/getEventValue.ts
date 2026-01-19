import { PlausibleEvent } from '../../../../../../__generated__/globalTypes'
import { BreakdownRow } from '../types'

export interface GetEventValueParams {
  row: BreakdownRow
  event: PlausibleEvent
}

export type GetEventValueReturn = number

/**
 * Extracts the visitor count for a specific event from a row's stats
 */
export function getEventValue(
  row: BreakdownRow,
  event: PlausibleEvent
): number {
  const stat = row.stats.find((s) => s.event === event)
  return stat?.visitors ?? 0
}
