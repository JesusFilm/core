import { GetTemplateFamilyStatsBreakdown } from '../../../../../__generated__/GetTemplateFamilyStatsBreakdown'

export type Order = 'asc' | 'desc'

export type SortableColumn =
  | 'journeyName'
  | 'views'
  | 'responses'
  | 'christDecisionCapture'
  | 'prayerRequestCapture'
  | 'specialVideoStartCapture'
  | 'specialVideoCompleteCapture'
  | 'gospelStartCapture'
  | 'gospelCompleteCapture'
  | 'rsvpCapture'
  | 'custom1Capture'
  | 'custom2Capture'
  | 'custom3Capture'

export type BreakdownRow = NonNullable<
  GetTemplateFamilyStatsBreakdown['templateFamilyStatsBreakdown']
>[0]

export interface ProcessedRow extends BreakdownRow {
  views: number
  responses: number
  christDecisionCapture: number
  prayerRequestCapture: number
  specialVideoStartCapture: number
  specialVideoCompleteCapture: number
  gospelStartCapture: number
  gospelCompleteCapture: number
  rsvpCapture: number
  custom1Capture: number
  custom2Capture: number
  custom3Capture: number
}
