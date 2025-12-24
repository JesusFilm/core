import { BreakdownRow, ProcessedRow } from '../types'

export type CreateInitialTotalRowReturn = ProcessedRow

/**
 * Creates an initial total row with all zeros
 */
export function createInitialTotalRow(): ProcessedRow {
  const baseRow: BreakdownRow = {
    __typename: 'TemplateFamilyStatsBreakdownResponse',
    journeyId: 'total',
    journeyName: 'TOTAL',
    teamName: '',
    status: null,
    stats: []
  }
  return {
    ...baseRow,
    views: 0,
    responses: 0,
    christDecisionCapture: 0,
    prayerRequestCapture: 0,
    specialVideoStartCapture: 0,
    specialVideoCompleteCapture: 0,
    gospelStartCapture: 0,
    gospelCompleteCapture: 0,
    rsvpCapture: 0,
    custom1Capture: 0,
    custom2Capture: 0,
    custom3Capture: 0
  }
}
