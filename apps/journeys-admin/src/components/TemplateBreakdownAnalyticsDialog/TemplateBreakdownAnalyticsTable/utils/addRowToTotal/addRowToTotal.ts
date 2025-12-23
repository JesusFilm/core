import { ProcessedRow } from '../types'

export interface AddRowToTotalParams {
  acc: ProcessedRow
  row: ProcessedRow
}

export type AddRowToTotalReturn = ProcessedRow

/**
 * Adds values from a row to the accumulator (for calculating totals)
 */
export function addRowToTotal(acc: ProcessedRow, row: ProcessedRow): ProcessedRow {
  return {
    ...acc,
    views: acc.views + row.views,
    responses: acc.responses + row.responses,
    christDecisionCapture: acc.christDecisionCapture + row.christDecisionCapture,
    prayerRequestCapture: acc.prayerRequestCapture + row.prayerRequestCapture,
    specialVideoStartCapture:
      acc.specialVideoStartCapture + row.specialVideoStartCapture,
    specialVideoCompleteCapture:
      acc.specialVideoCompleteCapture + row.specialVideoCompleteCapture,
    gospelStartCapture: acc.gospelStartCapture + row.gospelStartCapture,
    gospelCompleteCapture:
      acc.gospelCompleteCapture + row.gospelCompleteCapture,
    rsvpCapture: acc.rsvpCapture + row.rsvpCapture,
    custom1Capture: acc.custom1Capture + row.custom1Capture,
    custom2Capture: acc.custom2Capture + row.custom2Capture,
    custom3Capture: acc.custom3Capture + row.custom3Capture
  }
}
