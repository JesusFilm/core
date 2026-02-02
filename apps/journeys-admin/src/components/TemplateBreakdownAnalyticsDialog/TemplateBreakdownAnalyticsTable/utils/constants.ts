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

type TranslationFunction = (key: string) => string

export const getColumnHeaders = (t: TranslationFunction) => [
  {
    id: 'journeyName' as SortableColumn,
    label: t('Team'),
    subtitle: t('Link to project')
  },
  { id: 'views' as SortableColumn, label: t('Views') },
  { id: 'responses' as SortableColumn, label: t('Responses') },
  {
    id: 'christDecisionCapture' as SortableColumn,
    label: t('Decision for Christ')
  },
  { id: 'prayerRequestCapture' as SortableColumn, label: t('Prayer Request') },
  {
    id: 'specialVideoStartCapture' as SortableColumn,
    label: t('Feature Video Started')
  },
  {
    id: 'specialVideoCompleteCapture' as SortableColumn,
    label: t('Feature Video Ended')
  },
  {
    id: 'gospelStartCapture' as SortableColumn,
    label: t('Gospel Presentation Started')
  },
  {
    id: 'gospelCompleteCapture' as SortableColumn,
    label: t('Gospel Presentation Completed')
  },
  { id: 'rsvpCapture' as SortableColumn, label: t('RSVP') },
  { id: 'custom1Capture' as SortableColumn, label: t('Custom Tracking 1') },
  { id: 'custom2Capture' as SortableColumn, label: t('Custom Tracking 2') },
  { id: 'custom3Capture' as SortableColumn, label: t('Custom Tracking 3') }
]
