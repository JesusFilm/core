import { SortableColumn } from './types'

export const UNKNOWN_JOURNEYS_AGGREGATE_ID = '__unknown_journeys__'

export const NUMERIC_COLUMNS: SortableColumn[] = [
  'views',
  'responses',
  'christDecisionCapture',
  'prayerRequestCapture',
  'specialVideoStartCapture',
  'specialVideoCompleteCapture',
  'gospelStartCapture',
  'gospelCompleteCapture',
  'rsvpCapture',
  'custom1Capture',
  'custom2Capture',
  'custom3Capture'
]

export const COLUMN_HEADERS = [
  {
    id: 'journeyName' as SortableColumn,
    label: 'Team',
    subtitle: 'Link to journey'
  },
  { id: 'views' as SortableColumn, label: 'Views' },
  { id: 'responses' as SortableColumn, label: 'Responses' },
  {
    id: 'christDecisionCapture' as SortableColumn,
    label: 'Decision for Christ'
  },
  { id: 'prayerRequestCapture' as SortableColumn, label: 'Prayer Request' },
  {
    id: 'specialVideoStartCapture' as SortableColumn,
    label: 'Feature Video Started'
  },
  {
    id: 'specialVideoCompleteCapture' as SortableColumn,
    label: 'Feature Video Ended'
  },
  {
    id: 'gospelStartCapture' as SortableColumn,
    label: 'Gospel Presentation Started'
  },
  {
    id: 'gospelCompleteCapture' as SortableColumn,
    label: 'Gospel Presentation Completed'
  },
  { id: 'rsvpCapture' as SortableColumn, label: 'RSVP' },
  { id: 'custom1Capture' as SortableColumn, label: 'Custom Event 1' },
  { id: 'custom2Capture' as SortableColumn, label: 'Custom Event 2' },
  { id: 'custom3Capture' as SortableColumn, label: 'Custom Event 3' }
]

