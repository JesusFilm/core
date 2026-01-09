import { ProcessedRow } from '../types'

export interface AddRestrictedRowToTotalParams {
  totalRow: ProcessedRow
  restrictedRow: ProcessedRow
}

export type AddRestrictedRowToTotalReturn = ProcessedRow

/**
 * Adds values from restricted row to total row
 */
export function addRestrictedRowToTotal(
  totalRow: ProcessedRow,
  restrictedRow: ProcessedRow
): ProcessedRow {
  return {
    ...totalRow,
    views: totalRow.views + restrictedRow.views,
    responses: totalRow.responses + restrictedRow.responses,
    christDecisionCapture:
      totalRow.christDecisionCapture + restrictedRow.christDecisionCapture,
    prayerRequestCapture:
      totalRow.prayerRequestCapture + restrictedRow.prayerRequestCapture,
    specialVideoStartCapture:
      totalRow.specialVideoStartCapture +
      restrictedRow.specialVideoStartCapture,
    specialVideoCompleteCapture:
      totalRow.specialVideoCompleteCapture +
      restrictedRow.specialVideoCompleteCapture,
    gospelStartCapture:
      totalRow.gospelStartCapture + restrictedRow.gospelStartCapture,
    gospelCompleteCapture:
      totalRow.gospelCompleteCapture + restrictedRow.gospelCompleteCapture,
    rsvpCapture: totalRow.rsvpCapture + restrictedRow.rsvpCapture,
    custom1Capture: totalRow.custom1Capture + restrictedRow.custom1Capture,
    custom2Capture: totalRow.custom2Capture + restrictedRow.custom2Capture,
    custom3Capture: totalRow.custom3Capture + restrictedRow.custom3Capture
  }
}
