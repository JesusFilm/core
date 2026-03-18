import { PlausibleEvent } from '../../../../../../__generated__/globalTypes'
import { getEventValue } from '../getEventValue'
import { BreakdownRow, ProcessedRow } from '../types'

export interface ProcessRowParams {
  row: BreakdownRow
}

export type ProcessRowReturn = ProcessedRow

/**
 * Processes a raw row by extracting all event values into a flat structure
 */
export function processRow(row: BreakdownRow): ProcessedRow {
  return {
    ...row,
    views: getEventValue(row, PlausibleEvent.journeyVisitors),
    responses: getEventValue(row, PlausibleEvent.journeyResponses),
    christDecisionCapture: getEventValue(
      row,
      PlausibleEvent.christDecisionCapture
    ),
    prayerRequestCapture: getEventValue(
      row,
      PlausibleEvent.prayerRequestCapture
    ),
    specialVideoStartCapture: getEventValue(
      row,
      PlausibleEvent.specialVideoStartCapture
    ),
    specialVideoCompleteCapture: getEventValue(
      row,
      PlausibleEvent.specialVideoCompleteCapture
    ),
    gospelStartCapture: getEventValue(row, PlausibleEvent.gospelStartCapture),
    gospelCompleteCapture: getEventValue(
      row,
      PlausibleEvent.gospelCompleteCapture
    ),
    rsvpCapture: getEventValue(row, PlausibleEvent.rsvpCapture),
    custom1Capture: getEventValue(row, PlausibleEvent.custom1Capture),
    custom2Capture: getEventValue(row, PlausibleEvent.custom2Capture),
    custom3Capture: getEventValue(row, PlausibleEvent.custom3Capture)
  }
}
