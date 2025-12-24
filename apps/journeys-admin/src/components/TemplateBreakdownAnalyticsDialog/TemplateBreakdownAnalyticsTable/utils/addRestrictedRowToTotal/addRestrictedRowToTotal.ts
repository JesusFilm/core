import { ProcessedRow } from '../types'

export interface AddRestrictedRowToTotalParams {
  totalRow: ProcessedRow
  restrictedRow: ProcessedRow
}

export type AddRestrictedRowToTotalReturn = void

/**
 * Adds values from restricted row to total row
 */
export function addRestrictedRowToTotal(
  totalRow: ProcessedRow,
  restrictedRow: ProcessedRow
): void {
  totalRow.views += restrictedRow.views
  totalRow.responses += restrictedRow.responses
  totalRow.christDecisionCapture += restrictedRow.christDecisionCapture
  totalRow.prayerRequestCapture += restrictedRow.prayerRequestCapture
  totalRow.specialVideoStartCapture += restrictedRow.specialVideoStartCapture
  totalRow.specialVideoCompleteCapture +=
    restrictedRow.specialVideoCompleteCapture
  totalRow.gospelStartCapture += restrictedRow.gospelStartCapture
  totalRow.gospelCompleteCapture += restrictedRow.gospelCompleteCapture
  totalRow.rsvpCapture += restrictedRow.rsvpCapture
  totalRow.custom1Capture += restrictedRow.custom1Capture
  totalRow.custom2Capture += restrictedRow.custom2Capture
  totalRow.custom3Capture += restrictedRow.custom3Capture
}
